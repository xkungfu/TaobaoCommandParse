// ==UserScript==
// @name            淘口令解析
// @name:en         Taobao Command Parse
// @namespace       net.coolkk.taobaocommandparse
// @description     将淘宝生成的淘口令转换为链接
// @description:en  Taobao Command Parse conversion into the link
// @version         1.4.0
// @author          Coolkk
// @icon            https://img.alicdn.com/tps/i3/T1OjaVFl4dXXa.JOZB-114-114.png
// @homepage        https://github.com/Coolkkmeat/TaobaoCommandParse
// @supportURL      https://github.com/Coolkkmeat/TaobaoCommandParse/issues
// @contributionURL https://coolkk.net/
// @license         Apache License 2.0
// @charset		    UTF-8
// @include         http*://*taobao.com/*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_registerMenuCommand
// @grant           GM_xmlhttpRequest
// @connect         taofake.com
// @connect         taodaxiang.com
// @run-at          document-idle
// ==/UserScript==

(function () {
    /**
     * 严格模式
     */
    "use strict";

    /**
     * 入口
     */
    //设置
    const config = { "data_source_list": ["taofake", "taodaxiang"], "data_source_now": GM_getValue("data_source_now", "taodaxiang") }
    GM_registerMenuCommand("设置数据源", function () {
        let configNew = prompt("解析功能的接口：" + config["data_source_list"].join(" 或 "), config["data_source_now"]);
        if (configNew && configNew !== config["data_source_now"] && config["data_source_list"].indexOf(configNew) > -1) {
            GM_setValue("data_source_now", configNew);
            window.location.reload();
        }
    });
    //获取元素
    let div = document.getElementById("oversea-searchbar");
    if (window.location.host == "world.taobao.com") {
        div.addEventListener("DOMNodeInserted", listenInserted);
    } else {
        getElement("other");
    }

    /**
     * 监听插入
     */
    function listenInserted() {
        getElement("world");
    }

    /**
     * 获取元素
     * @param {string} type 站点类型
     */
    function getElement(type) {
        let element;
        switch (type) {
            case "world"://全球站
                element = document.getElementById("mq");
                if (element != null) {
                    div.removeEventListener("DOMNodeInserted", listenInserted);
                    listenInput(element);
                }
                break;
            case "other"://其它站
                element = document.getElementById("q");
                listenInput(element);
                break;
        }
    }

    /**
     * 监听输入
     * @param {element} element 元素
     */
    function listenInput(element) {
        if (element == null) return;
        element.addEventListener("input", function (e) {
            work(e.target.value)
        });
    }

    /**
     * 处理
     * @param {string} text 文本
     */
    function work(text) {
        let symbols = ["\\$", "¥", "€", "₤", "₳", "¢", "¤", "฿", "₵", "₡", "₫", "ƒ", "₲", "₭", "£", "₥", "₦", "₱", "〒", "₮", "₩", "₴", "₪", "៛", "﷼", "₢", "M", "₰", "₯", "₠", "₣", "₧", "ƒ", "￥", "\/", "\\(", "\\)"];
        let regExpParamPrepare = symbols.join("|");
        let regExpParam = `(${regExpParamPrepare})([a-zA-Z0-9]*)(${regExpParamPrepare})`;
        let regExpObject = new RegExp(regExpParam);
        let code = text.match(regExpObject);
        code = code == undefined ? false : code[2];
        if (code) {
            switch (config["data_source_now"]) {
                case "taofake":
                    GM_xmlhttpRequest({
                        url: "//www.taofake.com/index/tools/gettkljm.html?tkl=" + code,
                        method: "GET",
                        responseType: "json",
                        timeout: 10000,
                        onload: function (res) {
                            res = JSON.parse(res.responseText);
                            if (res.code == 1) {
                                window.location.href = res.data.url;
                            }
                        }
                    });
                    break;
                case "taodaxiang":
                    GM_xmlhttpRequest({
                        url: "//taodaxiang.com/taopass/parse/get",
                        method: "POST",
                        responseType: "json",
                        timeout: 10000,
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        data: `content=${code}`,
                        onload: function (res) {
                            res = JSON.parse(res.responseText);
                            console.log(res)///
                            if (res.code == 0) {
                                window.location.href = res.data.url;
                            }
                        }
                    });
                    break;
            }
        }
    }
})();