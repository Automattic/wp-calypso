// Polyfills required for the "fallback" build of Calypso.
// Note that these polyfills will not necessarily be included in the build,
// since Calypso makes use of @babel/preset-env and browserslist configs to
// avoid including polyfills for features that are supported acroll all target
// browsers.

/**
 * External dependencies
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import svg4everybody from 'svg4everybody';
import 'isomorphic-fetch';

svg4everybody();
