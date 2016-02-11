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
} from 'state/site-settings/exporter/selectors';
import {
	setPostType,
	startExport,
	advancedSettingsFetch
} from 'state/site-settings/exporter/actions';

function mapStateToProps( state ) {
	return {
		siteId: state.ui.selectedSiteId,
		postType: getSelectedPostType( state ),
		shouldShowProgress: shouldShowProgress( state )
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		setPostType: compose( dispatch, setPostType ),
		startExport: compose( dispatch, startExport ),
		advancedSettingsFetch: compose( dispatch, advancedSettingsFetch )
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( Exporter );
