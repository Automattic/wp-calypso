/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

import moment from 'moment';

import { States } from './constants.js';

function mapOptions( state, section, name, mapFunc ) {
	const rawData = state.siteSettings.exporter.data.get( 'advancedSettings' );
	if ( !rawData || rawData.count() === 0 ) return [];

	return rawData.get( section ).get( name ).map( mapFunc );
}

export function getAuthorOptions( state, section ) {
	return mapOptions( state, section, 'authors', ( author ) => ( {
		value: author.get( 'ID' ), label: author.get( 'name' )
	} ) );
}

export function getStatusOptions( state, section ) {
	return mapOptions( state, section, 'statuses', ( status ) => ( {
		value: status.get( 'name' ), label: status.get( 'label' )
	} ) );
}

export function getDateOptions( state, section, endOfMonth ) {
	return mapOptions( state, section, 'export_date_options', ( date ) => {
		const year = parseInt( date.get( 'year' ) );
		// API months start at 1 (Jan = 1)
		const month = parseInt( date.get( 'month' ) );
		// JS months start at 0 (Jan = 0)
		const jsMonth = month - 1;

		if ( month === 0 || year === 0 ) {
			return {
				value: '0',
				label: i18n.translate( 'Unknown' )
			}
		}

		let time = moment( { year: year, month: jsMonth, day: 1 } );

		if ( endOfMonth ) {
			time = time.endOf( 'month' );
		}

		return {
			// eg: 2015-06-30
			value: time.format( 'YYYY-MM-DD' ),

			// eg: Dec 2015
			label: time.format( 'MMM YYYY' )
		}
	} );
}

export function getCategoryOptions( state, section ) {
	return mapOptions( state, section, 'categories', ( category ) => ( {
		value: category.get( 'name' ), label: category.get( 'name' )
	} ) );
}

/**
 * This function transforms the current UI state into the data ready for
 * sending to the server.
 *
 * @param  {Object} state      Global state tree
 * @param  {string} postType   The type of post to export (optional)
 * @return {Object}            Data to be sent to the server for starting the export
 */
export function prepareExportRequest( state, postType ) {
	const data = state.siteSettings.exporter.ui.get( 'advancedSettings' );

	let requestData = {};

	if ( ! postType ) {
		// No postType specified - export everything
		return {};
	}

	requestData.content = postType;

	const prepareSetting = ( section, setting ) => {
		const value = data.get( section ).get( setting );
		if ( parseInt( value ) === 0 ) {
			return undefined;
		}

		return value;
	}

	if ( postType === 'posts' ) {
		requestData.post_author = prepareSetting( 'posts', 'author' );
		requestData.post_status = prepareSetting( 'posts', 'status' );
		requestData.post_start_date = prepareSetting( 'posts', 'startDate' );
		requestData.post_end_date = prepareSetting( 'posts', 'endDate' );
		requestData.cat = prepareSetting( 'posts', 'category' );
	} else if ( postType === 'pages' ) {
		requestData.page_author = prepareSetting( 'pages', 'author' );
		requestData.page_status = prepareSetting( 'pages', 'status' );
		requestData.page_start_date = prepareSetting( 'pages', 'startDate' );
		requestData.page_end_date = prepareSetting( 'pages', 'endDate' );
	}

	return requestData;
}

/**
 * Indicates that the available options in the advanced settings section
 * are being loaded
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if activity is in progress
 */
export function isLoadingOptions( state ) {
	const dataState = getDataState( state );

	// The options are being loaded if a site ID has been set but the options are null
	return !!( dataState.forSiteId && ! dataState.advancedSettings );
}

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if activity is in progress
 */
export function shouldShowProgress( state ) {
	const exportingState = getUIState( state ).exportingState;

	return ( exportingState === States.STARTING || exportingState === States.EXPORTING );
}

/**
 * Return the exporter UI state as a plain JS object.
 *
 * @param  {Object} state    Global state tree
 * @return {Object}          Exporter UI state
 */
export function getUIState( state ) {
	return state.siteSettings.exporter.ui.toJS();
}

export function getDataState( state ) {
	return state.siteSettings.exporter.data.toJS();
}
