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
} from 'state/site-settings/exporter/selectors';
import {
	advancedSettingsFetch,
	exportStatusFetch,
	setPostType,
	startExport,
} from 'state/site-settings/exporter/actions';

function mapStateToProps( state ) {
	const siteId = state.ui.selectedSiteId;

	return {
		siteId,
		postType: getSelectedPostType( state ),
		shouldShowProgress: shouldShowProgress( state, siteId ),
		isExporting: isExporting( state, siteId ),
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		advancedSettingsFetch: compose( dispatch, advancedSettingsFetch ),
		exportStatusFetch: compose( dispatch, exportStatusFetch ),
		setPostType: compose( dispatch, setPostType ),
		startExport: compose( dispatch, startExport ),
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( Exporter );
