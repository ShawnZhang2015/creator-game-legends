/**
 * Creator星球游戏开发社区 张晓衡
 * 组件：RewardedVideoAd
 * 功能：激励视频广告组件
 * 时间：2020-5-16
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class RewardedVideoAd extends cc.Component {
    static caches: any = {}; //{ adUnitId, {rewardedVideoAd, playCount} }

    @property({ tooltip: '加载后立即播放'})
    playOnLoad: boolean = false;

    @property({ tooltip:'激励视频广告ID'})
    adUnitId: string = '';
    
    @property({type: cc.Integer, tooltip:'最大播放次数', range:[1, 999, 1]})
    maxCount: number = 10;

    @property({ type: [cc.Component.EventHandler], tooltip:'激励事件函数，发放奖励' })
    events: Array<cc.Component.EventHandler> = [];

    @property(cc.Prefab)
    simulationVideoPrefab: cc.Prefab = null;

    @property({type: cc.Label})
    timesLabel: cc.Label = null;
    /**
     * 组件加载
     */
    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.target.pauseSystemEvents();
            this.play();
            this.scheduleOnce(() => {
                event.target.resumeSystemEvents();    
            }, 1);
        });
        
        if (!this.adUnitId) {
            console.log('视频广告ID不存在，直接通过');
            if (this.playOnLoad) {
                this.simulationPlayVideoAd(10);  
            }
            return;     
        }

        if (cc.sys.WECHAT_GAME === cc.sys.platform) {
            this.init();
        } else  {
            if (this.timesLabel && !CC_EDITOR) {
                this.timesLabel.node.active = false;
            }

            if(this.playOnLoad) {
                this.simulationPlayVideoAd(10);
            }
        }
    }

    /**
     * 初始化激励视频广告
     */
    init() {
        let item = RewardedVideoAd.caches[this.adUnitId];
        if (item) {
            console.log('视频广告已经创建');
            return;
        } else {
            item = {playCount: 0};
            RewardedVideoAd.caches[this.adUnitId] = item;
        }
       
        item.rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: this.adUnitId
        });

        item.rewardedVideoAd.onLoad(() => {
            console.log('广告加载成功');
            //加载播放
            if (this.playOnLoad) {
                this.playOnLoad = false;
                this.play();
            }
        });

        item.rewardedVideoAd.onError(error => {
            console.log('广告加载失败：', error);
            item.rewardedVideoAd.load();
        });
        
        if (this.timesLabel) {
            this.timesLabel.string = `剩余${this.maxCount - item.playCount}次`;
        }
    }

    /**
     * 播放广告
     */
    play() {
        if (cc.sys.WECHAT_GAME !== cc.sys.platform) {
            this.simulationPlayVideoAd();
            return;
        }

        let item = RewardedVideoAd.caches[this.adUnitId];
        if (!item) {
            console.log(`广告${this.adUnitId}不存`);
            return;
        }

        if (item.playCount >= this.maxCount) {
            console.log(`广告${this.adUnitId}，到达放最大次数，退出播放`);
            return;
        }

        item.rewardedVideoAd.show();

        let callback = (res) => {
            item.rewardedVideoAd.offClose(callback);
            if (res && res.isEnded || res === undefined) {
                item.playCount++;
                cc.Component.EventHandler.emitEvents(this.events, res);

                if (this.timesLabel) {
                    this.timesLabel.string = `剩余${this.maxCount - item.playCount}次`;
                }
            }
        }
        item.rewardedVideoAd.onClose(callback);
    }

    /**
     * 模拟播放视频广告，可以删除
     * @param second 模拟时间
     */
    simulationPlayVideoAd(second: number = 10) {
        if (!this.simulationVideoPrefab) {
            console.log('没有设置模拟广告');
            return;
        }
        let scene = cc.director.getScene();
        let node = cc.instantiate(this.simulationVideoPrefab);
        let videoAd = node.getComponent(this.simulationVideoPrefab.name);
        videoAd.second = second;
        scene.addChild(node);
        let callback = (res) => {
            if (res && res.isEnded || res === undefined) {
                cc.Component.EventHandler.emitEvents(this.events, res);
            }
        }
        videoAd.onClose(callback);
    }
}
