/**
 * 张晓衡
 * 2020-5-20
 * 场景加载
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadScene extends cc.Component {
    @property(cc.SceneAsset)
    scene: cc.SceneAsset = null;

    @property
    click: boolean = true;
   
    onLoad() {
        if (this.click) {
            this.node.on(cc.Node.EventType.TOUCH_END, () => {
                this.loadScene();
            }, this);
        }
    };

    loadScene() {
        if (this.scene) {
            cc.director.loadScene(this.scene.name, () => {
                cc.log('场景加载成功！');
            });
        }
    }
}