/** @format */
// Initialize polyfills before any dependencies are loaded
import './polyfills';

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { invoke } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { configureReduxStore, locales, setupMiddlewares, utils } from './common';
import createReduxStoreFromPersistedInitialState from 'state/initial-state';
import detectHistoryNavigation from 'lib/detect-history-navigation';
import userFactory from 'lib/user';

const debug = debugFactory( 'calypso' );

const boot = currentUser => {
	debug( "Starting Calypso. Let's do this." );

	const project = require( `./project/${ PROJECT_NAME }` );
	utils();
	invoke( project, 'utils' );
	createReduxStoreFromPersistedInitialState( reduxStore => {
		locales( currentUser, reduxStore );
		invoke( project, 'locales', currentUser, reduxStore );
		configureReduxStore( currentUser, reduxStore );
		invoke( project, 'configureReduxStore', currentUser, reduxStore );
		setupMiddlewares( currentUser, reduxStore );
		invoke( project, 'setupMiddlewares', currentUser, reduxStore );
		detectHistoryNavigation.start();
		page.start( { decodeURLComponents: false } );
	} );
};

window.AppBoot = () => {
	const user = userFactory();
	if ( user.initialized ) {
		boot( user );
	} else {
		user.once( 'change', () => boot( user ) );
	}
};

//TODO Gutenberg assumes globals, remove this later. Is there an init happening elsewhere?
import { createElement, Component } from '@wordpress/element';

window.wp = {};

// Necessary for the pragma config
// Component is used by the Dashicon component
window.wp.element = { createElement, Component };

// Necessary for wp.date
window._wpDateSettings = {
	l10n: {
		locale: 'fr_FR',
		months: [
			'janvier',
			'février',
			'mars',
			'avril',
			'mai',
			'juin',
			'juillet',
			'août',
			'septembre',
			'octobre',
			'novembre',
			'décembre',
		],
		monthsShort: [
			'Jan',
			'Fév',
			'Mar',
			'Avr',
			'Mai',
			'Juin',
			'Juil',
			'Août',
			'Sep',
			'Oct',
			'Nov',
			'Déc',
		],
		weekdays: [ 'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi' ],
		weekdaysShort: [ 'dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam' ],
		meridiem: { am: ' ', pm: ' ', AM: ' ', PM: ' ' },
		relative: { future: '%s à partir de maintenant', past: 'Il y a %s' },
	},
	formats: {
		time: 'G \\h i \\m\\i\\n',
		date: 'j F Y',
		datetime: 'j F Y G \\h i \\m\\i\\n',
	},
	timezone: { offset: 1, string: 'Europe/Paris' },
};

// User settings used to persist store caches
window.userSettings = { uid: 'dummy' };

// API globals
window.wpApiSettings = {
	schema: {},
};
window.wp.api = {
	getPostTypeRoute() {
		return '/none';
	},
};
window.wp.apiRequest = () => {
	return Promise.reject( 'no API support yet' );
};
