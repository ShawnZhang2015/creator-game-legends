
const {ccclass, property} = cc._decorator;

@ccclass
export default class VideoAd extends cc.Component {
    @property({type:cc.Integer})
    second: number = 5;

    @property(cc.Label)
    secondLabel: cc.Label = null;

    closeCallback: Function = null;
    onLoad () {
        this.node.setContentSize(cc.winSize);
        this.node.position = cc.v2(cc.winSize.width / 2, -cc.winSize.height / 2);
        let moveBy = cc.moveBy(0.5, cc.v2(0, cc.winSize.height));
        this.node.runAction(moveBy);
        this.secondLabel.string = `${this.second}秒`; 
        this.schedule(this.updateTime, 1);
    }

    updateTime() {
        if (this.second <= 0) {
            this.unschedule(this.updateTime);
            this.secondLabel.string = '完成'; 
            return;
        }
        this.secondLabel.string = `${--this.second}秒`; 
    }

    onClose(callback) {
        this.closeCallback = callback;
    }

    close() {
        this.node.destroy();
    }

    onDestroy() {
        if (this.closeCallback) {
            this.closeCallback({isEnded: this.second <= 0})  
        }
    }
}
