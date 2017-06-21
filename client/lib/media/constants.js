/**
 * External dependencies
 */
import keyMirror from 'key-mirror';

/**
 * An enum set of possible media validation errors.
 *
 * @type {Object}
 * @typedef MediaValidationError
 */
export const ValidationErrors = keyMirror( {
	FILE_TYPE_UNSUPPORTED: null,
	FILE_TYPE_NOT_IN_PLAN: null,
	SERVER_ERROR: null,
	UPLOAD_VIA_URL_404: null,
	EXCEEDS_MAX_UPLOAD_SIZE: null,
	EXCEEDS_PLAN_STORAGE_LIMIT: null,
	NOT_ENOUGH_SPACE: null
} );

export const ThumbnailSizeDimensions = {
	thumbnail: {
		width: 150,
		height: 150
	},
	medium: {
		width: 300,
		height: 300
	},
	large: {
		width: 1024,
		height: 1024
	}
};

export const VideoPressFileTypes = [
	'ogv',
	'mp4',
	'm4v',
	'mov',
	'wmv',
	'avi',
	'mpg',
	'3gp',
	'3g2'
];

export const GalleryColumnedTypes = [ 'default', 'circle', 'square' ];
export const GallerySizeableTypes = [ 'default' ];
export const GalleryDefaultAttrs = {
	items: [],
	type: 'default',
	columns: 3,
	orderBy: 'menu_order',
	link: '',
	size: 'thumbnail'
};

/**
 * Dictionary of common file extensions mapped to respective mime type.
 *
 * Adapted from WordPress
 *
 * @copyright 2015 by the WordPress contributors.
 * @license See CREDITS.md.
 * @see https://github.com/WordPress/WordPress/blob/4.2.4/wp-includes/functions.php#L2156-L2277
 */
export const MimeTypes = {
	// Image formats
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	jpe: 'image/jpeg',
	gif: 'image/gif',
	png: 'image/png',
	bmp: 'image/bmp',
	tif: 'image/tiff',
	tiff: 'image/tiff',
	ico: 'image/x-icon',

	// Video formats
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

	// Text formats
	txt: 'text/plain',
	asc: 'text/plain',
	c: 'text/plain',
	cc: 'text/plain',
	h: 'text/plain',
	csv: 'text/csv',
	tsv: 'text/tab-separated-values',
	ics: 'text/calendar',
	rtx: 'text/richtext',
	css: 'text/css',
	htm: 'text/html',
	html: 'text/html',

	// Audio formats
	mp3: 'audio/mpeg',
	m4a: 'audio/mpeg',
	m4b: 'audio/mpeg',
	ra: 'audio/x-realaudio',
	ram: 'audio/x-realaudio',
	wav: 'audio/wav',
	ogg: 'audio/ogg',
	oga: 'audio/ogg',
	mid: 'audio/midi',
	midi: 'audio/midi',
	wma: 'audio/x-ms-wma',
	wax: 'audio/x-ms-wax',
	mka: 'audio/x-matroska',

	// Misc application formats
	rtf: 'application/rtf',
	js: 'application/javascript',
	pdf: 'application/pdf',
	swf: 'application/x-shockwave-flash',
	class: 'application/java',
	tar: 'application/x-tar',
	zip: 'application/zip',
	gz: 'application/x-gzip',
	gzip: 'application/x-gzip',
	rar: 'application/rar',
	'7z': 'application/x-7z-compressed',
	exe: 'application/x-msdownload',

	// MS Office formats
	doc: 'application/msword',
	pot: 'application/vnd.ms-powerpoint',
	pps: 'application/vnd.ms-powerpoint',
	ppt: 'application/vnd.ms-powerpoint',
	wri: 'application/vnd.ms-write',
	xla: 'application/vnd.ms-excel',
	xls: 'application/vnd.ms-excel',
	xlt: 'application/vnd.ms-excel',
	xlw: 'application/vnd.ms-excel',
	mdb: 'application/vnd.ms-access',
	mpp: 'application/vnd.ms-project',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	docm: 'application/vnd.ms-word.document.macroEnabled.12',
	dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
	dotm: 'application/vnd.ms-word.template.macroEnabled.12',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
	xlsb: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
	xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
	xltm: 'application/vnd.ms-excel.template.macroEnabled.12',
	xlam: 'application/vnd.ms-excel.addin.macroEnabled.12',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	pptm: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
	ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
	ppsm: 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
	potx: 'application/vnd.openxmlformats-officedocument.presentationml.template',
	potm: 'application/vnd.ms-powerpoint.template.macroEnabled.12',
	ppam: 'application/vnd.ms-powerpoint.addin.macroEnabled.12',
	sldx: 'application/vnd.openxmlformats-officedocument.presentationml.slide',
	sldm: 'application/vnd.ms-powerpoint.slide.macroEnabled.12',
	onetoc: 'application/onenote',
	onetoc2: 'application/onenote',
	onetmp: 'application/onenote',
	onepkg: 'application/onenote',

	// OpenOffice formats
	odt: 'application/vnd.oasis.opendocument.text',
	odp: 'application/vnd.oasis.opendocument.presentation',
	ods: 'application/vnd.oasis.opendocument.spreadsheet',
	odg: 'application/vnd.oasis.opendocument.graphics',
	odc: 'application/vnd.oasis.opendocument.chart',
	odb: 'application/vnd.oasis.opendocument.database',
	odf: 'application/vnd.oasis.opendocument.formula',

	// WordPerfect formats
	wp: 'application/wordperfect',
	wpd: 'application/wordperfect',

	// iWork formats
	key: 'application/vnd.apple.keynote',
	numbers: 'application/vnd.apple.numbers',
	pages: 'application/vnd.apple.pages',
};

export const MEDIA_IMAGE_THUMBNAIL = 'MEDIA_IMAGE_THUMBNAIL';
export const MEDIA_IMAGE_PHOTON = 'MEDIA_IMAGE_PHOTON';
export const MEDIA_IMAGE_RESIZER = 'MEDIA_IMAGE_RESIZER';
