/** @format */

/**
 * External dependencies
 */
import React from 'react';

export default [
	{
		name: 'core/audio',
		attributes: {
			autoplay: false,
			caption: 'Cartoon Birds',
			loop: false,
			preload: 'none',
			src: 'http://soundbible.com/mp3/cartoon-birds-2_daniel-simion.mp3',
		},
	},
	{
		name: 'core/button',
		attributes: {
			text: 'Click here',
			backgroundColor: 'vivid-cyan-blue',
			url: 'https://wordpress.com',
			title: 'Visit WordPress.com',
		},
	},
	{
		name: 'core/code',
		attributes: {
			content: '<div>\n\t<p>My paragraph</p>\n</div>',
		},
	},
	{
		name: 'core/columns',
		attributes: {
			columns: 2,
		},
		inner: [
			{
				name: 'core/column',
				attributes: {},
				inner: [
					{
						name: 'core/paragraph',
						attributes: {
							content: 'Column 1',
						},
					},
				],
			},
			{
				name: 'core/column',
				attributes: {},
				inner: [
					{
						name: 'core/paragraph',
						attributes: {
							content: 'Column 2',
						},
					},
				],
			},
		],
	},
	{
		name: 'core/cover-image',
		attributes: {
			url: 'https://cldup.com/Fz-ASbo2s3.jpg',
			title: 'My title',
			hasParallax: false,
			dimRatio: 50,
			align: 'center',
			contentAlign: 'center',
		},
	},
	{
		name: 'core/file',
		attributes: {
			href: 'https://automattic.files.wordpress.com/2018/05/wordpressdotcom_wbadge-blk1.pdf',
			fileName: 'WordPress.com Logo',
			textLinkHref:
				'https://automattic.files.wordpress.com/2018/05/wordpressdotcom_wbadge-blk1.pdf',
			textLinkTarget: '_blank',
			showDownloadButton: true,
			downloadButtonText: 'Download',
		},
	},
	{
		name: 'core/gallery',
		attributes: {
			images: [
				{
					url: 'https://cldup.com/n0g6ME5VKC.jpg',
					caption: 'Image 1',
				},
				{
					url: 'https://cldup.com/ZjESfxPI3R.jpg',
					caption: 'Image 2',
				},
				{
					url: 'https://cldup.com/EKNF8xD2UM.jpg',
					caption: 'Image 3',
				},
			],
			columns: 2,
			imageCrop: true,
		},
	},
	{
		name: 'core/heading',
		attributes: {
			align: 'center',
			level: 2,
			content: 'My heading',
		},
	},
	{
		name: 'core/image',
		attributes: {
			url: 'https://cldup.com/8lhI-gKnI2.jpg',
			alt: 'My image',
			caption: 'My image',
			align: 'left',
			href: 'https://cldup.com/8lhI-gKnI2.jpg',
			width: '200',
			height: '200',
			id: 123,
		},
	},
	{
		name: 'core/list',
		attributes: {
			ordered: false,
			values: [ <li>Item 1</li>, <li>Item 2</li> ],
		},
	},
	{
		name: 'core/paragraph',
		attributes: {
			align: 'center',
			content: 'This is a paragraph',
			dropCap: false,
		},
	},
	{
		name: 'core/preformatted',
		attributes: {
			content: 'Text with\nspacings\n\tand tabs',
		},
	},
	{
		name: 'core/pullquote',
		attributes: {
			value: [ { children: 'Code is poetry' } ],
			citation: [ 'The WordPress community' ],
			align: 'center',
		},
	},
];
