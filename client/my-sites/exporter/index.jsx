/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { compose } from 'lodash';

/**
 * Internal dependencies
 */
import Exporter from './exporter';
import { getUIState, shouldShowProgress } from 'state/site-settings/exporter/selectors';
import { setPostType, startExport } from 'state/site-settings/exporter/actions';

function mapStateToProps( state, ownProps ) {
	const uiState = getUIState( state );

	return {
		site: ownProps.site,
		postType: uiState.postType,
		advancedSettings: uiState.advancedSettings,
		shouldShowProgress: shouldShowProgress( state )
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		setPostType: compose( dispatch, setPostType ),
		startExport: () => startExport()( dispatch )
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( Exporter );
