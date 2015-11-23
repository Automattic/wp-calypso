/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { compose } from 'lodash';

/**
 * Internal dependencies
 */
import Exporter from './exporter';
import { toggleAdvancedSettings, toggleSection } from 'state/site-settings/exporter/actions';

function mapStateToProps( state ) {
	return {
		advancedSettings: state.siteSettings.exporter.ui.toJS().advancedSettings,
	}
}

function mapDispatchToProps( dispatch ) {
	return {
		toggleAdvancedSettings: compose( dispatch, toggleAdvancedSettings ),
		toggleSection: compose( dispatch, toggleSection )
	}
}

export default connect( mapStateToProps, mapDispatchToProps )( Exporter );
