/**
 * Wordpress dependencies
 */

import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */

 /**
 * Internal dependencies
 */

export const CONFIG = {
	name: 'atavist/title-design',
	title: __( 'Title Design' ),
	icon: <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="icon" transform="translate(-2.000000, -2.000000)"><path d="M4,4 L11,4 L11,2 L4,2 C2.9,2 2,2.9 2,4 L2,11 L4,11 L4,4 Z M10,13 L6,18 L18,18 L15,14 L12.97,16.71 L10,13 Z M11,8.5 C11,7.67 10.33,7 9.5,7 C8.67,7 8,7.67 8,8.5 C8,9.33 8.67,10 9.5,10 C10.33,10 11,9.33 11,8.5 Z M20,2 L13,2 L13,4 L20,4 L20,11 L22,11 L22,4 C22,2.9 21.1,2 20,2 Z M20,20 L13,20 L13,22 L20,22 C21.1,22 22,21.1 22,20 L22,13 L20,13 L20,20 Z M4,13 L2,13 L2,20 C2,21.1 2.9,22 4,22 L11,22 L11,20 L4,20 L4,13 Z" id="Shape" fill="#000000" fill-rule="nonzero"></path><polygon id="Shape" points="0 0 24 0 24 24 0 24"></polygon></g></g></svg>,
	category: 'layout',
	keywords: [
		__( 'Title Design' ),
		__( 'Atavist' )
	],
	attributes: {
		title: {
			type: 'string',
			source: 'text',
			selector: '.cover-title'
		},
		subtitle: {
			type: 'string',
			source: 'text',
			selector: '.cover-subtitle'
		},
		byline: {
			type: 'string',
			source: 'text',
			selector: '.cover-byline'
		},
		id: {
			type: 'number',
		},
		url: {
			type: 'string',
		},
		dimensions: {
			type: 'object',
			default: {
				height: 0,
				width: 0
			}
		},
		type: {
			type: 'string',
		},
		titlePosition: {
			type: 'string',
			default: 'center-middle'
		},
		shimColor: {
			type: 'string',
			default: '#000'
		},
		shimOpacityRatio: {
			type: 'number',
			default: 50,
		},
		focalPoint: {
			type: 'object',
			default: {
				x: 0.5,
				y: 0.5
			}
		}
	},
	titlePositionOptions: [
		{
			value: 'top-left',
			label: __( 'Top left' )
		},
		{
			value: 'top-middle',
			label: __( 'Top middle' )
		},
		{
			value: 'top-right',
			label: __( 'Top right' )
		},
		{
			value: 'center-left',
			label: __( 'Center left' )
		},
		{
			value: 'center-middle',
			label: __( 'Centered' )
		},
		{
			value: 'center-right',
			label: __( 'Center right' )
		},
		{
			value: 'bottom-left',
			label: __( 'Bottom left' )
		},
		{
			value: 'bottom-middle',
			label: __( 'Bottom middle' )
		},
		{
			value: 'bottom-right',
			label: __( 'Bottom right' )
		},
	]
}
