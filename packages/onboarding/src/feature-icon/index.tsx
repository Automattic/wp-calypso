/**
 * External dependencies
 */
import * as React from 'react';
import { SVG, Path } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import type { WPCOMFeatures } from '@automattic/data-stores';

export const iconList: Record< WPCOMFeatures.FeatureId, React.ReactElement > = {
	domain: (
		<SVG viewBox="0 0 24 24">
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12ZM15.703 8.00002H18.918C18.054 6.51302 16.731 5.32502 15.138 4.64302C15.283 5.34902 15.515 6.57602 15.703 8.00002ZM13.014 4.07214C13.082 4.42414 13.401 6.11014 13.659 8.00014H10.341C10.599 6.11014 10.918 4.42414 10.986 4.07214C11.319 4.02914 11.656 4.00014 12 4.00014C12.344 4.00014 12.681 4.02914 13.014 4.07214ZM13.891 14.0001C13.957 13.2861 14 12.5981 14 12.0001C14 11.4021 13.957 10.7141 13.891 10.0001H10.109C10.043 10.7141 10 11.4021 10 12.0001C10 12.5981 10.043 13.2861 10.109 14.0001H13.891ZM8.862 4.64302C8.717 5.34902 8.485 6.57602 8.297 8.00002H5.082C5.946 6.51302 7.269 5.32502 8.862 4.64302ZM8.08401 10.0001H4.26301C4.09801 10.6411 4.00001 11.3081 4.00001 12.0001C4.00001 12.6921 4.09701 13.3591 4.26301 14.0001H8.08501C8.03301 13.3321 8.00001 12.6561 8.00001 12.0001C8.00001 11.3441 8.03301 10.6681 8.08401 10.0001ZM5.082 16.0001H8.297C8.485 17.4241 8.717 18.6501 8.862 19.3571C7.269 18.6751 5.946 17.4871 5.082 16.0001ZM10.341 16.0001C10.598 17.8901 10.918 19.5751 10.986 19.9281C11.319 19.9711 11.656 20.0001 12 20.0001C12.344 20.0001 12.681 19.9711 13.014 19.9281C13.082 19.5761 13.401 17.8901 13.659 16.0001H10.341ZM15.138 19.3571C15.283 18.6501 15.515 17.4241 15.703 16.0001H18.918C18.054 17.4871 16.731 18.6751 15.138 19.3571ZM15.916 14.0001H19.737C19.903 13.3591 20 12.6921 20 12.0001C20 11.3081 19.902 10.6411 19.736 10.0001H15.915C15.967 10.6681 16 11.3441 16 12.0001C16 12.6561 15.967 13.3321 15.916 14.0001Z"
			/>
		</SVG>
	),
	store: (
		<SVG viewBox="0 0 24 24">
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M19.348 11.434C19.145 12.349 18.333 13 17.396 13H7V15H17C18.105 15 19 15.895 19 17H7C5.895 17 5 16.105 5 15V13V5V4H3V2H5C6.105 2 7 2.895 7 4V5H21L19.348 11.434ZM8.99999 19.9999C8.99999 21.0999 8.09999 21.9999 6.99999 21.9999C5.89999 21.9999 5.00999 21.0999 5.00999 19.9999C5.00999 18.8999 5.89999 17.9999 6.99999 17.9999C8.09999 17.9999 8.99999 18.8999 8.99999 19.9999ZM17 17.9999C15.9 17.9999 15.01 18.8999 15.01 19.9999C15.01 21.0999 15.9 21.9999 17 21.9999C18.1 21.9999 19 21.0999 19 19.9999C19 18.8999 18.1 17.9999 17 17.9999Z"
			/>
		</SVG>
	),
	seo: (
		<SVG viewBox="0 0 24 24">
			<Path d="M8.1437 15.8563H5.57227V9.42773H8.1437V15.8563Z" />
			<Path d="M13.2862 15.8571H10.7148V3H13.2862V15.8571Z" />
			<Path d="M18.4289 15.8574H15.8574V6.85742H18.4289V15.8574Z" />
			<Path fillRule="evenodd" clipRule="evenodd" d="M21 20.7148H3V18.7148H21V20.7148Z" />
		</SVG>
	),
	plugins: (
		<SVG viewBox="0 0 24 28">
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M4 2.27539C2.78 3.32215 2 5.11415 2 6.8265C2 9.34099 3.79 11.3776 6 11.3776C6.387 11.3776 6.753 11.2866 7.093 11.1364C7.686 11.9761 8.28 12.8158 8.9 13.6304L10.978 11.2638C10.264 10.5584 9.528 9.8803 8.788 9.20446C8.92 8.81989 9 8.40346 9 7.96428C9 6.07898 7.657 4.55095 6 4.55095C4.69 4.55095 4 3.23681 4 2.27539ZM15.492 13.0934L14.152 14.618C16.08 16.7627 17.905 19.0258 19.6 21.4185L20.75 23.0398L19.25 24.7465L17.825 23.4403C15.722 21.5095 13.733 19.4331 11.848 17.2394L5 25.031L3 22.7554L13.493 10.8167C13.188 10.1261 13 9.35806 13 8.53317C13 5.70579 15.015 3.41317 17.5 3.41317C18.225 3.41317 18.9 3.62707 19.507 3.97409L16 7.96428L18 10.2398L21.507 6.24965C21.812 6.94028 22 7.70828 22 8.53317C22 11.3605 19.985 13.6532 17.5 13.6532C16.775 13.6532 16.099 13.4393 15.492 13.0934Z"
			/>
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M4 2.27539C2.78 3.32215 2 5.11415 2 6.8265C2 9.34099 3.79 11.3776 6 11.3776C6.387 11.3776 6.753 11.2866 7.093 11.1364C7.686 11.9761 8.28 12.8158 8.9 13.6304L10.978 11.2638C10.264 10.5584 9.528 9.8803 8.788 9.20446C8.92 8.81989 9 8.40346 9 7.96428C9 6.07898 7.657 4.55095 6 4.55095C4.69 4.55095 4 3.23681 4 2.27539ZM15.492 13.0934L14.152 14.618C16.08 16.7627 17.905 19.0258 19.6 21.4185L20.75 23.0398L19.25 24.7465L17.825 23.4403C15.722 21.5095 13.733 19.4331 11.848 17.2394L5 25.031L3 22.7554L13.493 10.8167C13.188 10.1261 13 9.35806 13 8.53317C13 5.70579 15.015 3.41317 17.5 3.41317C18.225 3.41317 18.9 3.62707 19.507 3.97409L16 7.96428L18 10.2398L21.507 6.24965C21.812 6.94028 22 7.70828 22 8.53317C22 11.3605 19.985 13.6532 17.5 13.6532C16.775 13.6532 16.099 13.4393 15.492 13.0934Z"
			/>
		</SVG>
	),
	'ad-free': (
		<SVG viewBox="0 0 24 24">
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M20.5875 3.42383L22.0017 4.83804L20.0003 6.83942V18.0006C20.0003 19.1051 19.1049 20.0006 18.0003 20.0006H6.8392L4.83316 22.0066L3.41895 20.5924L20.5875 3.42383ZM12.4198 14.4202L13.4203 15.4207L14.4203 14.4207C15.0499 13.9172 15.9566 13.9645 16.5303 14.5307L18.0003 16.0007V8.83959L12.4198 14.4202ZM6.00035 6.00023H15.1626L17.1626 4.00023H6.00035C4.89578 4.00023 4.00035 4.89566 4.00035 6.00023V17.1625L9.58148 11.5814L8.19035 10.1902L6.00035 12.3802V6.00023Z"
			/>
		</SVG>
	),
	'image-storage': (
		<SVG viewBox="0 0 24 24">
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M22 4V16C22 17.105 21.105 18 20 18H7.99999C6.89499 18 5.99999 17.105 5.99999 16V4C5.99999 2.895 6.89499 2 7.99999 2H20C21.105 2 22 2.895 22 4ZM18 19.9998H4V5.99984C2.895 5.99984 2 6.89484 2 7.99984V19.9998C2 21.0998 2.9 21.9998 4 21.9998H16C17.105 21.9998 18 21.1048 18 19.9998ZM16.5 5.99984C15.672 5.99984 15 6.67184 15 7.49984C15 8.32784 15.672 8.99984 16.5 8.99984C17.328 8.99984 18 8.32784 18 7.49984C18 6.67184 17.328 5.99984 16.5 5.99984ZM8 10.3332V4.00016H20V12.2342L19.487 11.6642C18.693 10.7792 17.306 10.7792 16.511 11.6642L15.855 12.3952L11 7.00016L8 10.3332Z"
			/>
		</SVG>
	),
	'video-storage': (
		<SVG viewBox="0 0 24 24">
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M2 12C2 6.47715 6.47715 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16 12L10 7.5V16.5L16 12Z"
			/>
		</SVG>
	),
	support: (
		<SVG viewBox="0 0 24 24">
			<Path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M1 10C1 11.1 1.9 12 3 12H6L9 15V12H11C12.1 12 13 11.1 13 10V5C13 3.9 12.1 3 11 3H3C1.9 3 1 3.9 1 5V10ZM23 16C23 17.1 22.1 18 21 18H18L15 21V18H13C11.9 18 11 17.1 11 16V14C13.2 14 15 12.2 15 10V9H21C22.1 9 23 9.9 23 11V16Z"
			/>
		</SVG>
	),
};

interface Props {
	featureId: WPCOMFeatures.FeatureId;
}

const FeatureIcon: React.FunctionComponent< Props > = ( { featureId } ) => (
	<Icon icon={ iconList[ featureId ] } />
);

export default FeatureIcon;
