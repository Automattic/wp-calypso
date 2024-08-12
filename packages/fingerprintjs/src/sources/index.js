'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.sources = void 0;
var tslib_1 = require( 'tslib' );
var entropy_source_1 = require( '../utils/entropy_source' );
var architecture_1 = tslib_1.__importDefault( require( './architecture' ) );
var audio_1 = tslib_1.__importDefault( require( './audio' ) );
var canvas_1 = tslib_1.__importDefault( require( './canvas' ) );
var color_depth_1 = tslib_1.__importDefault( require( './color_depth' ) );
var color_gamut_1 = tslib_1.__importDefault( require( './color_gamut' ) );
var contrast_1 = tslib_1.__importDefault( require( './contrast' ) );
var cookies_enabled_1 = tslib_1.__importDefault( require( './cookies_enabled' ) );
var cpu_class_1 = tslib_1.__importDefault( require( './cpu_class' ) );
var device_memory_1 = tslib_1.__importDefault( require( './device_memory' ) );
var dom_blockers_1 = tslib_1.__importDefault( require( './dom_blockers' ) );
var font_preferences_1 = tslib_1.__importDefault( require( './font_preferences' ) );
var fonts_1 = tslib_1.__importDefault( require( './fonts' ) );
var forced_colors_1 = tslib_1.__importDefault( require( './forced_colors' ) );
var hardware_concurrency_1 = tslib_1.__importDefault( require( './hardware_concurrency' ) );
var hdr_1 = tslib_1.__importDefault( require( './hdr' ) );
var indexed_db_1 = tslib_1.__importDefault( require( './indexed_db' ) );
var inverted_colors_1 = tslib_1.__importDefault( require( './inverted_colors' ) );
var languages_1 = tslib_1.__importDefault( require( './languages' ) );
var local_storage_1 = tslib_1.__importDefault( require( './local_storage' ) );
var math_1 = tslib_1.__importDefault( require( './math' ) );
var monochrome_1 = tslib_1.__importDefault( require( './monochrome' ) );
var open_database_1 = tslib_1.__importDefault( require( './open_database' ) );
var os_cpu_1 = tslib_1.__importDefault( require( './os_cpu' ) );
var pdf_viewer_enabled_1 = tslib_1.__importDefault( require( './pdf_viewer_enabled' ) );
var platform_1 = tslib_1.__importDefault( require( './platform' ) );
var plugins_1 = tslib_1.__importDefault( require( './plugins' ) );
var reduced_motion_1 = tslib_1.__importDefault( require( './reduced_motion' ) );
var screen_frame_1 = require( './screen_frame' );
var screen_resolution_1 = tslib_1.__importDefault( require( './screen_resolution' ) );
var session_storage_1 = tslib_1.__importDefault( require( './session_storage' ) );
var timezone_1 = tslib_1.__importDefault( require( './timezone' ) );
var touch_support_1 = tslib_1.__importDefault( require( './touch_support' ) );
var vendor_1 = tslib_1.__importDefault( require( './vendor' ) );
var vendor_flavors_1 = tslib_1.__importDefault( require( './vendor_flavors' ) );
var video_card_1 = tslib_1.__importDefault( require( './video_card' ) );
/**
 * The list of entropy sources used to make visitor identifiers.
 *
 * This value isn't restricted by Semantic Versioning, i.e. it may be changed without bumping minor or major version of
 * this package.
 *
 * Note: Rollup and Webpack are smart enough to remove unused properties of this object during tree-shaking, so there is
 * no need to export the sources individually.
 */
exports.sources = {
	// READ FIRST:
	// See https://github.com/fingerprintjs/fingerprintjs/blob/master/contributing.md#how-to-make-an-entropy-source
	// to learn how entropy source works and how to make your own.
	// The sources run in this exact order.
	// The asynchronous sources are at the start to run in parallel with other sources.
	fonts: fonts_1.default,
	domBlockers: dom_blockers_1.default,
	fontPreferences: font_preferences_1.default,
	audio: audio_1.default,
	screenFrame: screen_frame_1.getRoundedScreenFrame,
	osCpu: os_cpu_1.default,
	languages: languages_1.default,
	colorDepth: color_depth_1.default,
	deviceMemory: device_memory_1.default,
	screenResolution: screen_resolution_1.default,
	hardwareConcurrency: hardware_concurrency_1.default,
	timezone: timezone_1.default,
	sessionStorage: session_storage_1.default,
	localStorage: local_storage_1.default,
	indexedDB: indexed_db_1.default,
	openDatabase: open_database_1.default,
	cpuClass: cpu_class_1.default,
	platform: platform_1.default,
	plugins: plugins_1.default,
	canvas: canvas_1.default,
	touchSupport: touch_support_1.default,
	vendor: vendor_1.default,
	vendorFlavors: vendor_flavors_1.default,
	cookiesEnabled: cookies_enabled_1.default,
	colorGamut: color_gamut_1.default,
	invertedColors: inverted_colors_1.default,
	forcedColors: forced_colors_1.default,
	monochrome: monochrome_1.default,
	contrast: contrast_1.default,
	reducedMotion: reduced_motion_1.default,
	hdr: hdr_1.default,
	math: math_1.default,
	videoCard: video_card_1.default,
	pdfViewerEnabled: pdf_viewer_enabled_1.default,
	architecture: architecture_1.default,
};
/**
 * Loads the built-in entropy sources.
 * Returns a function that collects the entropy components to make the visitor identifier.
 */
function loadBuiltinSources( options ) {
	return ( 0, entropy_source_1.loadSources )( exports.sources, options, [] );
}
exports.default = loadBuiltinSources;
