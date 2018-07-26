'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _jetpackMarkdownBlockEditor = require('./jetpack-markdown-block-editor');

var _jetpackMarkdownBlockEditor2 = _interopRequireDefault(_jetpackMarkdownBlockEditor);

var _jetpackMarkdownBlockSave = require('./jetpack-markdown-block-save');

var _jetpackMarkdownBlockSave2 = _interopRequireDefault(_jetpackMarkdownBlockSave);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Internal dependencies
 */
var __ = window.wp.i18n.__; /**
                             * External dependencies
                             */

var registerBlockType = window.wp.blocks.registerBlockType;


registerBlockType('jetpack/markdown-block', {

	title: __('Markdown'),

	description: [__('Write your content in plain-text Markdown syntax.'), wp.element.createElement(
		'p',
		null,
		wp.element.createElement(
			'a',
			{ href: 'https://en.support.wordpress.com/markdown-quick-reference/' },
			'Support Reference'
		)
	)],

	icon: wp.element.createElement(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			'class': 'dashicon',
			width: '20',
			height: '20',
			viewBox: '0 0 208 128',
			stroke: 'currentColor'
		},
		wp.element.createElement('rect', {
			width: '198',
			height: '118',
			x: '5',
			y: '5',
			ry: '10',
			'stroke-width': '10',
			fill: 'none'
		}),
		wp.element.createElement('path', { d: 'M30 98v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39zM155 98l-30-33h20v-35h20v35h20z' })
	),

	category: 'formatting',

	attributes: {
		//The Markdown source is saved in the block content comments delimiter
		source: { type: 'string' }
	},

	edit: _jetpackMarkdownBlockEditor2['default'],

	save: _jetpackMarkdownBlockSave2['default']

});