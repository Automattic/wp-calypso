// Information taken from client/lib/media/constants.js

import { getAllowedFileTypesForSite } from 'calypso/lib/media/utils';
import type { SiteDetails } from '@automattic/data-stores';

const allowedImageMap = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	jpe: 'image/jpeg',
	gif: 'image/gif',
	png: 'image/png',
	bmp: 'image/bmp',
	tif: 'image/tiff',
	tiff: 'image/tiff',
	ico: 'image/x-icon',
};

const allowedVideoMap = {
	asf: 'video/x-ms-asf',
	asx: 'video/x-ms-asf',
	wmv: 'video/x-ms-wmv',
	wmx: 'video/x-ms-wmx',
	wm: 'video/x-ms-wm',
	avi: 'video/avi',
	divx: 'video/divx',
	flv: 'video/x-flv',
	mov: 'video/quicktime',
	qt: 'video/quicktime',
	mpeg: 'video/mpeg',
	mpg: 'video/mpeg',
	mpe: 'video/mpeg',
	mp4: 'video/mp4',
	m4v: 'video/mp4',
	ogv: 'video/ogg',
	webm: 'video/webm',
	mkv: 'video/x-matroska',
};

const allImageExtensions = Object.keys( allowedImageMap );
const allVideoExtensions = Object.keys( allowedVideoMap );

const fallbackAllowedSiteExtensions = [
	'gif',
	'heic',
	'jpeg',
	'png',
	'webp',
	'avi',
	'mpg',
	'mp4',
	'm4v',
	'mov',
	'ogv',
	'wmv',
	'3gp',
	'3g2',
];
function getAllowedImageExtensionsString( site?: SiteDetails | null ) {
	const allowedSiteExtensions = site
		? getAllowedFileTypesForSite( site )
		: fallbackAllowedSiteExtensions;
	return allImageExtensions
		.filter( ( extension ) => allowedSiteExtensions.includes( extension ) )
		.map( ( type ) => `.${ type }` )
		.join();
}

function getAllowedVideoExtensionsString( site?: SiteDetails | null ) {
	const allowedSiteExtensions = site
		? getAllowedFileTypesForSite( site )
		: fallbackAllowedSiteExtensions;
	return allVideoExtensions
		.filter( ( extension ) => allowedSiteExtensions.includes( extension ) )
		.map( ( type ) => `.${ type }` )
		.join();
}

export { getAllowedImageExtensionsString, getAllowedVideoExtensionsString };
