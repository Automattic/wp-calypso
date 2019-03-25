/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';

export const DEFAULT_FORMAT = 'mrec';
export const AD_FORMATS = [
	{
		height: 250,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
			</SVG>
		),
		name: __( 'Rectangle 300x250' ),
		tag: DEFAULT_FORMAT,
		width: 300,
		editorPadding: 30,
	},
	{
		height: 90,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-4h-4v-2h2c1.1 0 2-.89 2-2V9c0-1.11-.9-2-2-2H9v2h4v2h-2c-1.1 0-2 .89-2 2v4h6v-2z" />
			</SVG>
		),
		name: __( 'Leaderboard 728x90' ),
		tag: 'leaderboard',
		width: 728,
		editorPadding: 60,
	},
	{
		height: 50,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M0 0h24v24H0V0z" />
				<Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-4v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V9c0-1.11-.9-2-2-2H9v2h4v2h-2v2h2v2H9v2h4c1.1 0 2-.89 2-2z" />
			</SVG>
		),
		name: __( 'Mobile Leaderboard 320x50' ),
		tag: 'mobile_leaderboard',
		width: 320,
		editorPadding: 100,
	},
	{
		height: 600,
		icon: (
			<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<Path fill="none" d="M.04 0h24v24h-24V0z" />
				<Path d="M19.04 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-14V5h14v14zm-6-2h2V7h-2v4h-2V7h-2v6h4z" />
			</SVG>
		),
		name: __( 'Wide Skyscraper 160x600' ),
		tag: 'wideskyscraper',
		width: 160,
		editorPadding: 30,
	},
];
