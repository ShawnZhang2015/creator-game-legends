let URL = "https://minigm.sarsgame.com/"
let POST = 'POST'
let GET = 'GET'
export function getAdress(appId, fileName) {
    let fileUrl = URL + 'public/' + appId + '/' + fileName
    return fileUrl
}

export class BoxItem {
    name;
    icon;
    bg;
    id;
    constructor(db) {
        for (const key in db) {
            if (db.hasOwnProperty(key)) {
                const element = db[key];
                this[key] = element
            }
        }
    }

    getIcon() {
        return getAdress(this.id, this.icon)
    }

    getBg() {
        return getAdress(this.id, this.bg)
    }

}

export default class SarsGameHelper {

    private static ins;

    static instance() {
        if (!this.ins) {
            this.ins = new SarsGameHelper();
        }
        return this.ins;
    }


    private itemMap = {}


    getIcon(appId) {
        let item = this.itemMap[appId]
        if (item) {
            return this.getAdress(appId, item.icon)
        }
    }

    getAdress(appId, fileName) {
        let fileUrl = URL + 'public/' + appId + '/' + fileName
        return fileUrl
    }

    getGameInfo(appId, callback) {
        this.sendRequest(URL + "getGameInfo", { appid: appId }, (err, msg) => {
            if(err){
                console.log(' sendRequest error ',err)
                return;
            }
            console.log(' msg',msg)
            msg = JSON.parse(msg)
            if (msg.data) {
                this.itemMap[msg.data.appId] = new BoxItem(msg.data);
                callback(null, this.itemMap[msg.data.appId])
            } else {
                callback("getGameInfo error appId is " + appId, null);
            }
        },GET)
    }
    /**
     * 
     * @param appID 
     * @param callback 
     */
    jumpToApp(appID, callback) {
        wx.navigateToMiniProgram({
            appId: appID,
            success: () => {
                callback(true)
            },
            fail: () => {
                callback(false)
            }
        })
    }

    /**
     * 将消息发往服务器做记录。
     * @param appId 
     */
    sendRecord(item) {

    }

    showIamge(item) {
        this.previewImage(item.getBg())
        this.sendRecord(item)
    }
    /**
     * 使用appId跳转失败后弹出二维码
     * @param imgUrl 
     */
    previewImage(imgUrl) {
        wx.previewImage({
            current: imgUrl, // 当前显示图片的http链接
            urls: [imgUrl] // 需要预览的图片http链接列表
        })
    }
    /**
     * 
     * @param address 
     * @param data 
     * @param callback 
     * @param method 
     */
    sendRequest(address, data, callback, method = 'POST') {
        let xhr = this.createXHR();
        xhr.timeout = 15000;
        xhr.ontimeout = function () {
            callback('time out ', null)
        }
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                var data = xhr.responseText;
                callback(null, data)
            } else {
                callback('error', null)
            }
        };
        // let data = message.getData();
        // let method = message.getMethod();
        data = this.getData(data)
        if (method == "GET") {
            address = address + "?" + data;
            xhr.open(method, address);
            xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
            console.log(' method ',method,'address ',address)
            try {
                xhr.send();
            } catch (error) {
                console.log("get  error ", error);
            }

        } else {
            // post请求
            xhr.open(method, address);
            xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
            try {
                xhr.send(data);
            } catch (error) {
                console.log("post  error ", error);
            }

        }
    }

    createXHR() {
        // IE7+,Firefox, Opera, Chrome ,Safari
        return new XMLHttpRequest();
    }

    getData(obj) {
        let data = ''
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const element = obj[key];
                if(data){
                    data += "&"
                }
                data += key + '=' + element;
            }
        }
        return data;
    }
}
