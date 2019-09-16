let wxconfig = {
    env: 'release-8b47d',
    db: null,

    inited: false,
    init() {
        wx.cloud.init({ env: this.env });
        this.db = wx.cloud.database({env: this.env});
        this.inited = true;
    }
}

if (cc.sys.platform == cc.sys.WECHAT_GAME) {
    wxconfig.init();
}

module.exports = wxconfig