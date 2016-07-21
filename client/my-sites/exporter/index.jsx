/**
 * External dependencies
 */
import { connect } from 'react-redux';
import flowRight from 'lodash/flowRight';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import config from 'config';
import Exporter from './exporter';
import { getSiteSlug } from 'state/sites/selectors';
import {
	shouldShowProgress,
	getSelectedPostType,
	isExporting,
	getExportingState,
} from 'state/site-settings/exporter/selectors';
import {
	advancedSettingsFetch,
	exportStatusFetch,
	setPostType,
	startExport,
} from 'state/site-settings/exporter/actions';
import { States } from 'state/site-settings/exporter/constants';

function mapStateToProps( state ) {
	const siteId = state.ui.selectedSiteId;

	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		postType: getSelectedPostType( state ),
		shouldShowProgress: shouldShowProgress( state, siteId ),
		isExporting: isExporting( state, siteId ),
		downloadURL: state.siteSettings.exporter.downloadURL,
		didComplete: getExportingState( state, siteId ) === States.COMPLETE,
		didFail: getExportingState( state, siteId ) === States.FAILED,
		showGuidedTransferOptions: config.isEnabled( 'manage/export/guided-transfer' ),

		// This will be replaced with a Redux selector once we've built out
		// the reducers
		isGuidedTransferInProgress: false,
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		advancedSettingsFetch: flowRight( dispatch, advancedSettingsFetch ),
		exportStatusFetch: flowRight( dispatch, exportStatusFetch ),
		setPostType: flowRight( dispatch, setPostType ),
		startExport: ( siteId, options ) => {
			analytics.tracks.recordEvent( 'calypso_export_start_button_click', {
				scope: ( options && options.exportAll === false ) ? 'selected' : 'all'
			} );
			dispatch( startExport( siteId, options ) );
		}
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( Exporter );
