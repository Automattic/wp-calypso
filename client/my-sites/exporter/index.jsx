/**
 * External dependencies
 */
import { connect } from 'react-redux';
import compose from 'lodash/function/compose';

/**
 * Internal dependencies
 */
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
	clearExport,
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
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		advancedSettingsFetch: compose( dispatch, advancedSettingsFetch ),
		exportStatusFetch: compose( dispatch, exportStatusFetch ),
		setPostType: compose( dispatch, setPostType ),
		startExport: compose( dispatch, startExport ),
		clearExport: compose( dispatch, clearExport ),
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( Exporter );
