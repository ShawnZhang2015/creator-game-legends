const {ccclass, property} = cc._decorator;

@ccclass
export default class testrewardedvideoad extends cc.Component {

    @property({type: [cc.Node]})
    nodes: Array<cc.Node> = [];

    showImage () {
        let index = Math.floor(Math.random() * 100) % this.nodes.length;
        let node = this.nodes[index];

        cc.tween(node)
        .to(5, {color: cc.Color.WHITE})
        .start();
        this.nodes.splice(index, 1);
    }

}
