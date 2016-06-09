/**
 * External dependencies
 */
import { connect } from 'react-redux';
import flowRight from 'lodash/flowRight';

/**
 * Internal dependencies
 */
import config from 'config';
import Exporter from './exporter';
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
		postType: getSelectedPostType( state ),
		shouldShowProgress: shouldShowProgress( state, siteId ),
		isExporting: isExporting( state, siteId ),
		downloadURL: state.siteSettings.exporter.downloadURL,
		didComplete: getExportingState( state, siteId ) === States.COMPLETE,
		didFail: getExportingState( state, siteId ) === States.FAILED,
		showGuidedTransferOptions: config.isEnabled( 'manage/export/guided-transfer' ),
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		advancedSettingsFetch: flowRight( dispatch, advancedSettingsFetch ),
		exportStatusFetch: flowRight( dispatch, exportStatusFetch ),
		setPostType: flowRight( dispatch, setPostType ),
		startExport: flowRight( dispatch, startExport ),
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( Exporter );
