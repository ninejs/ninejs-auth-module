(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "ninejs/modules/moduleDefine", "./Auth"], factory);
    }
})(function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    const moduleDefine_1 = require("ninejs/modules/moduleDefine");
    const Auth_1 = require("./Auth");
    exports.default = moduleDefine_1.define(['ninejs', 'webserver', 'ninejs/auth/impl'], function (provide) {
        provide('ninejs/auth', function (config, ninejs, webserver, impl) {
            var log = ninejs.get('logger');
            log.info('ninejs/auth module starting');
            var auth = new Auth_1.default(config, ninejs, webserver, impl);
            return auth;
        });
    });
});
//# sourceMappingURL=module.js.map