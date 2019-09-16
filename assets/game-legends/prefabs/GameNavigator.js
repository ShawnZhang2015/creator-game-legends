let wxconfig = require('wxconfig');
let SarsGameHelper = require('SarsGameHelper').default;

let Type = cc.Enum({
    LOCAL:      -1,     //本地模式，手动指定appid
    WX_CLOUD:   -1,     //微信云模式，手动或随机获取云上的appid
    SARS_GAME:  -1,     //微笑游戏，手动指定appid
});

let GameNavigator = cc.Class({
    extends: cc.Component,

    properties: {
        appid: '',
        type: {
            type: Type,
            default: Type.LOCAL,
        }
    },

    statics: {
        gameInfos: null,
    },

    start () {
        //初始化组件节点
        this.label = cc.find('label', this.node).getComponent(cc.Label);
        this.image = cc.find('icon/image', this.node).getComponent(cc.Sprite);
        this.loading = cc.find('icon/loading', this.node);

        //初始化加载
        this.image.node.active = false;
        this.loading.runAction(cc.rotateBy(1, -360).repeatForever());

        //注册点击事件
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);

        //加载游戏信息
        if (!GameNavigator.gameInfos) {
            this._loadGameInfos((gameInfos) => {
                GameNavigator.gameInfos = gameInfos;
                this._initGameInfo();
            });
        } else {
            this._initGameInfo();     
        }
    },

    /**
     * 加载游戏信息
     * @param {*} cb 
     */
    _loadGameInfos(cb) {
    
        if (this.type === Type.WX_CLOUD) {
            this._loadWxGameInfo(cb);
        } else if (this.type === Type.SARS_GAME) {
            this._loadSarsGameInfo(cb);
        }
    },

    /**
     * 从微信云获取游戏信息
     * @param {*} cb 
     */
    _loadWxGameInfo(cb) {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME || !wxconfig.inited) {
            return;     
        }
    
        //数据库
        wxconfig.db.collection('gameInfos').field({
            _id: false,
        }).get({
            success (res) {
                if (cb) {
                    cb(res.data);
                }
            },
            fail (res) {
                cc.log(res);
            }
        });
    },

    /**
     * 从微笑游戏获取游戏信息
     */
    _loadSarsGameInfo(cb) {
        let boxHelper = SarsGameHelper.instance();
        boxHelper.getGameInfo(this.appid, (err, item) => {
            if (err) {
                console.log('从SarsGame获取游戏信息失败', err)
                return;
            }
         
            item.icon = item.getIcon();
            item.appid = item.id;
            cb([item]);
        })
    },

    /**
     * 初始化游戏图标
     */
    _initGameInfo() {
        let setGameInfo = (gameInfo) => {
            this.gameInfo = gameInfo;
            this.appid = gameInfo.appid;
            this.label.string = gameInfo.name.substr(0, 4);
            this._loadIcon(gameInfo.icon, this.image);
            this.image.node.active = true;
            this.loading.active = false;    
        }

        let gameInfo;
        let gameInfos = GameNavigator.gameInfos;
        if (this.appid) {
            gameInfo = gameInfos.find(item => item.appid === this.appid || item.id === this.appid);
        }

        gameInfo = gameInfo || gameInfos[ Math.floor(Math.random() * 100000) % gameInfos.length];
        setGameInfo(gameInfo);
    },

    /**
     * 加载游戏图标
     */
    _loadIcon(url, sprite) {
        if (!sprite) {
            cc.warn('Sprite组件不存在，不加载游戏图标');
            return;
        }
        
        cc.loader.load({ url, type: 'png' }, (err, texture) => {
            if (err) {
                cc.error(err);
                return;
            }
            sprite.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    /**
     * 点击事件
     */
    _onTouchEnd() {
        if (!this.appid) {
            return;
        }
       
        wx.navigateToMiniProgram({
            appId: this.appid,
            path: '',
            extraData: {
            },
            envVersion: 'release',
            success(res) {
                cc.log('跳转成功');
            },
            fail: () => {
                if (this.type === Type.SARS_GAME) {
                    SarsGameHelper.instance().showIamge(this.gameInfo);  
                } 
            }
        })
    }
});
