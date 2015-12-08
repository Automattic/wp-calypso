/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { compose } from 'lodash';

/**
 * Internal dependencies
 */
import Exporter from './exporter';

import {
	getUIState,
	getAuthorOptions,
	getStatusOptions,
	getDateOptions,
	getCategoryOptions,
	prepareExportRequest,
	shouldShowProgress,
} from 'state/site-settings/exporter/selectors';

import {
	setPostType,
	setAdvancedSetting,
	startExport,
	fetchExportSettings
} from 'state/site-settings/exporter/actions';

/**
 * Module Variables
 */
var lastSiteId = null;

function mapStateToProps( state, ownProps ) {
	const uiState = getUIState( state );

	return {
		site: ownProps.site,
		postType: uiState.postType,
		advancedSettings: uiState.advancedSettings,
		shouldShowProgress: shouldShowProgress( state ),
		options: {
			posts: {
				authors: getAuthorOptions( state, 'post' ),
				statuses: getStatusOptions( state, 'post' ),
				dates: getDateOptions( state, 'post' ),
				categories: getCategoryOptions( state, 'post' )
			},
			pages: {
				authors: getAuthorOptions( state, 'page' ),
				statuses: getStatusOptions( state, 'page' ),
				dates: getDateOptions( state, 'page' )
			}
		}
	};
}

function mapDispatchToProps( dispatch, ownProps ) {
	// This is working but not very nice, it should be called inside the component
	// mapDispatchToProps should be a pure map with no side-effects
	if ( lastSiteId !== ownProps.site.ID ) {
		lastSiteId = ownProps.site.ID;
		fetchExportSettings( ownProps.site.ID )( dispatch );
	}

	return {
		setPostType: compose( dispatch, setPostType ),
		setAdvancedSetting: compose( dispatch, setAdvancedSetting ),
		startExport: () => dispatch( startExport( ownProps.site.ID ) )
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( Exporter );
