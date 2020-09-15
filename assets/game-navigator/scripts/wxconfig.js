let wxconfig = {
    env: 'release-8b47d',
    db: null,

    inited: false,
    init() {
        wx.cloud.init({ env: this.env });
        this.db = wx.cloud.database({env: this.env});
        this.inited = true;
    },

    previewImage(imgUrl) {
        wx.previewImage({
            current: imgUrl, // 当前显示图片的http链接
            urls: [imgUrl]   // 需要预览的图片http链接列表
        });
    }
}

if (cc.sys.platform == cc.sys.WECHAT_GAME) {
    wxconfig.init();
}

module.exports = wxconfig