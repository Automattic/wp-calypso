/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import { isFetchingPreferences } from 'state/preferences/selectors';
import { saveConfirmationSidebarPreference } from 'state/ui/editor/actions';
import { isConfirmationSidebarEnabled } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class PublishConfirmation extends Component {

	constructor( props ) {
		super( props );
		this.state = { isToggleOn: props.publishConfirmationEnabled };
		this.handleToggle = this.handleToggle.bind( this );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.publishConfirmationEnabled !== this.state.isToggleOn ) {
			this.setState( { isToggleOn: nextProps.publishConfirmationEnabled } );
		}
	}

	handleToggle() {
		const { siteId, savePublishConfirmationPreference } = this.props;
		const isToggleOn = ! this.state.isToggleOn;
		this.setState( { isToggleOn: isToggleOn } );
		savePublishConfirmationPreference( siteId, isToggleOn );
	}

	render() {
		const { fetchingPreferences, translate } = this.props;

		return (
			<FormFieldset className="composing__publish-confirmation has-divider is-bottom-only">
				<QueryPreferences />
				<CompactFormToggle
					checked={ this.state.isToggleOn }
					disabled={ fetchingPreferences }
					onChange={ this.handleToggle }
				>
					{ translate( 'Show publish confirmation' ) }
				</CompactFormToggle>

				<FormSettingExplanation isIndented>
					{ translate(
						'This adds a confirmation step with helpful settings and tips ' +
						'for double-checking your content before publishing.'
					) }
				</FormSettingExplanation>
			</FormFieldset>
		);
	}
}

PublishConfirmation.defaultProps = {
	publishConfirmationEnabled: true,
};

PublishConfirmation.propTypes = {
	siteId: PropTypes.number,
	fetchingPreferences: PropTypes.bool,
	publishConfirmationEnabled: PropTypes.bool,
	savePublishConfirmationPreference: PropTypes.func,
	translate: PropTypes.func,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			fetchingPreferences: isFetchingPreferences( state ),
			publishConfirmationEnabled: isConfirmationSidebarEnabled( state, siteId ),
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			savePublishConfirmationPreference: saveConfirmationSidebarPreference,
		}, dispatch );
	},
)( localize( PublishConfirmation ) );
