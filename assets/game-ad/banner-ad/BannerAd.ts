/**
 * Creator星球游戏开发社区 张晓衡
 * 组件：BannerAd
 * 功能：Banner广告组件
 * 时间：2020-9-14
 */

const {ccclass, property} = cc._decorator;

//广告的位置
enum Placement {
    TOP,
    MIDDLE,
    BOTTOM,
}

class BannerItem {
   
    private ad: any = null;             //广告对象
    private timestamp: number = 0;      //创建时间
    
    init(adUnitId: string, expires: number, placement: Placement) {
        if (this.ad) {
            if (Date.now() - this.timestamp < expires * 1000) {
                this.ad.show();
                return;
            }
            this.ad.destroy();
        }

        //创建 Banner
        let frameSize = cc.view.getFrameSize();
        this.ad = wx.createBannerAd({
            adUnitId,
            style: {
                left: 0,
                top: 0,
                width: frameSize.width
            }
        });
        
        //调整位置
        this.ad.onResize((size) => {
            const {
                windowWidth,
                windowHeight
            } = wx.getSystemInfoSync();

            switch(placement) {
                case Placement.TOP: 
                    this.ad.style.top = 0
                    break;
                case Placement.MIDDLE:
                    this.ad.style.top = (windowHeight - size.height) / 2;
                    break;
                default:
                    this.ad.style.top = windowHeight - size.height;
            }
            
            this.ad.style.left = (windowWidth - size.width) / 2;
            this.ad.show();
        });

        //错误监听
        this.ad.onError(() => {
            this.ad = null;
            this.timestamp = 0;
            console.log(`加载BannerAd:${this.ad.adUnitId}失败`);
        });
    }

    close() {
        this.ad.hide();
    }
}

@ccclass
export default class BannerAd extends cc.Component {
    static caches: Map<string, BannerItem> = new Map();
   
    @property({ tooltip:'Banner广告ID'})
    adUnitId: string = '';

    @property({type: cc.Enum(Placement), tooltip: '广告位置：上、中、下'})
    placement: Placement = Placement.BOTTOM;

    @property({tooltip: '过期时间(秒)，销毁重新创建'})
    expires: number = 30;
    
    start () {
        if (cc.sys.platform !== cc.sys.WECHAT_GAME || !this.adUnitId) {
            return;
        }
        let item = BannerAd.caches.get(this.adUnitId)
        if (!item) {
            item = new BannerItem()
            BannerAd.caches.set(this.adUnitId, item);
        }
        item.init(this.adUnitId, this.expires, this.placement);
    }

    onDestroy() {
        BannerAd.caches.forEach(item => item.close());
    }
}