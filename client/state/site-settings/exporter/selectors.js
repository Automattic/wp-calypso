/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

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

export function getDateOptions( state, section ) {
	const months = [ 'N/A', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

	return mapOptions( state, section, 'export_date_options', ( date ) => {
		if ( parseInt( date.get( 'month' ) ) === 0 || parseInt( date.get( 'year' ) ) === 0 ) {
			return {
				value: '0',
				label: i18n.translate( 'Unknown' )
			}
		}

		return {
			value: `${ date.get( 'year' ) }-${ date.get( 'month' ) }`,
			label: `${ months[ date.get( 'month' ) ] } ${ date.get( 'year' ) }`
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
 * @param  {Object} state    Global state tree
 * @return {Object}          Data to be sent to the server for starting the export
 */
export function prepareExportRequest( state ) {
	const data = state.siteSettings.exporter.ui.get( 'advancedSettings' );

	let requestData = {};
	const postsEnabled = data.get( 'posts' ).get( 'isEnabled' );
	const pagesEnabled = data.get( 'pages' ).get( 'isEnabled' );

	if ( postsEnabled && pagesEnabled ) {
		requestData.content = 'all';
	} else if ( postsEnabled ) {
		requestData.content = 'posts';
	} else if ( pagesEnabled ) {
		requestData.content = 'pages';
	}

	const prepareSetting = ( section, setting ) => {
		const value = data.get( section ).get( setting );
		if ( parseInt( value ) === 0 ) {
			return undefined;
		}

		return value;
	}

	requestData.post_author = prepareSetting( 'posts', 'author' );
	requestData.post_status = prepareSetting( 'posts', 'status' );
	requestData.post_start_date = prepareSetting( 'posts', 'startDate' );
	requestData.post_end_date = prepareSetting( 'posts', 'endDate' );
	requestData.cat = prepareSetting( 'posts', 'category' );

	requestData.page_author = prepareSetting( 'pages', 'author' );
	requestData.page_status = prepareSetting( 'pages', 'status' );
	requestData.page_start_date = prepareSetting( 'pages', 'startDate' );
	requestData.page_end_date = prepareSetting( 'pages', 'endDate' );

	return requestData;
}

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if activity is in progress
 */
export function shouldShowProgress( state ) {
	const exportingState = state.siteSettings.exporter.ui.get( 'exportingState' );

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
