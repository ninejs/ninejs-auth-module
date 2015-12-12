/// <amd-dependency path="ninejs/css!./LoginScreen.css" />
/// <amd-dependency path="ninejs/nineplate!./LoginScreen.html" />
'use strict';

import Skin from 'ninejs/ui/Skin'
import setClass from 'ninejs/ui/utils/setClass'
import { when, defer } from 'ninejs/core/deferredUtils'
import on from 'ninejs/core/on'
import bootstrap from 'ninejs/ui/bootstrap/bootstrap'

declare var require: any;
let css = require('ninejs/css!./LoginScreen.css');
let template = require('ninejs/nineplate!./LoginScreen.html');

var validateInput = function (isValid: boolean) {
	var valid = isValid && this.userNameText.value && this.passwordText.value;
	setClass(this.loginIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
	if (valid) {
		setClass(this.loginIcon, 'glyphicon-check', 'valid');
	}
	else {
		setClass(this.loginIcon, 'glyphicon-exclamation-sign', 'invalid');
	}
};
var validateUserName = function () {
	validateInput.call(this);
};
var validateUserNameBlur = function () {
	var deferred = defer(),
		value = this.userNameText.value,
		self = this;
	if (this.userNameValidation) {
		when(this.userNameValidation(value), function (result) {
			deferred.resolve(result);
		});
	}
	else {
		deferred.resolve(true);
	}
	return when(deferred.promise, function (valid) {
		setClass(self.userNameIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
		if (valid) {
			setClass(self.userNameIcon, 'glyphicon-check', 'valid');
		}
		else {
			setClass(self.userNameIcon, 'glyphicon-exclamation-sign', 'invalid');
		}
		return valid;
	});
};
var validatePassword = function () {
	var message = '';
	if (this.passwordValidation) {
		message = this.passwordValidation(this.passwordText.value);
	}
	setClass(this.passwordIcon, '!valid', '!invalid', '!glyphicon-exclamation-sign', '!glyphicon-check');
	if (!message) {
		setClass(this.passwordIcon, 'glyphicon-check', 'valid');
	}
	else {
		setClass(this.passwordIcon, 'glyphicon-exclamation-sign', 'invalid');
	}
	validateInput.call(this, !message);
};
export default new Skin({
	cssList: [css],
	template: template,
	updated: function (control: any) {
		bootstrap.enable('css');
		control.own(
			on(control.userNameText, 'keyup', function () {
				control.currentSkin.validateUserName.call(control);
			}),
			on(control.userNameText, 'blur', function () {
				control.currentSkin.validateUserNameBlur.call(control);
			}),
			on(control.passwordText, 'keyup', function () {
				control.currentSkin.validatePassword.call(control);
			})
		);
	},

	validateInput: validateInput,
	validateUserName: validateUserName,
	validateUserNameBlur: validateUserNameBlur,
	validatePassword: validatePassword
});