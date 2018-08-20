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
			content: 'export default function MyButton() {\n\treturn <Button>Click Me!</Button>;\n}',
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
			value: [
				{
					children: '<p>Code is poetry</p>',
				},
			],
			citation: [ 'The WordPress community' ],
		},
	},
	{
		name: 'core/quote',
		attributes: {
			value: [
				{
					children: '<p>Code is poetry</p>',
				},
			],
			citation: [ 'The WordPress community' ],
			align: 'left',
			className: 'is-style-large',
		},
	},
	{
		name: 'core/separator',
		attributes: {},
	},
	{
		name: 'core/spacer',
		attributes: {
			height: 150,
		},
	},
	{
		name: 'core/subhead',
		attributes: {
			align: 'center',
			content: 'My subhead',
		},
	},
	{
		name: 'core/table',
		attributes: {
			content: '<tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody>',
			hasFixedLayout: true,
		},
	},
	{
		name: 'core/text-columns',
		attributes: {
			content: [ { children: 'Column 1' }, { children: 'Column 2' } ],
			columns: 2,
			width: 'center',
		},
	},
	{
		name: 'core/verse',
		attributes: {
			content:
				'An old silent pond...\n' +
				'A frog jumps into the pond,\n' +
				'splash! Silence again.\n' +
				'\n' +
				'Autumn moonlight—\n' +
				'a worm digs silently\n' +
				'into the chestnut.\n' +
				'\n' +
				'In the twilight rain\n' +
				'these brilliant-hued hibiscus —\n' +
				'A lovely sunset.',
			textAlign: 'center',
		},
	},
	{
		name: 'core/video',
		attributes: {
			autoplay: false,
			caption: '',
			controls: true,
			loop: false,
			muted: false,
			src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.ogv',
		},
	},
];
