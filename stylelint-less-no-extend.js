'use strict';
/* eslint-env node, es6 */

const stylelint = require('stylelint');
const report = stylelint.utils.report;
const ruleMessages = stylelint.utils.ruleMessages;
const validateOptions = stylelint.utils.validateOptions;
const postcssSelectorParser = require('postcss-selector-parser');

const ruleName = 'tradingview/less-no-extend';

const messages = ruleMessages(ruleName, {
	rejected: 'Unexpected :extend',
});

const rule = stylelint.createPlugin(ruleName, options => {
	return (root, result) => {
		if (root.source.lang !== 'less') {
			return;
		}
		const validOptions = validateOptions(result, ruleName, {
			possible: [true, false],
			actual: options
		});
		if (!validOptions) {
			return;
		}
		if (options === false) {
			return;
		}
		root.walkRules((rule) => {
			// Quick and dirty check
			if (!rule.selector.includes(':extend')) {
				return;
			}

			// Hack for LESS double slash comments
			const selector = rule.selector.replace(
				/\/\/[^\r\n]*/,
				(s) => '\u0020'.repeat(s.length)
			);

			// Check using selector parser to prevent false positives
			postcssSelectorParser(selectors => {
				selectors.walkPseudos(pseudo => {
					if (pseudo.value === ':extend') {
						report({
							message: messages.rejected,
							node: rule,
							word: ':extend',
							result,
							ruleName,
						});
					}
				});
			}).processSync(selector);
		});
	};
});

rule.ruleName = ruleName;
rule.messages = messages;
module.exports = rule;
