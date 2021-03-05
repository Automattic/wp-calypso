/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { isFetchingPreferences } from 'calypso/state/preferences/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isConfirmationSidebarEnabled } from 'calypso/state/editor/selectors';
import { saveConfirmationSidebarPreference } from 'calypso/state/editor/actions';

class PublishConfirmation extends Component {
	constructor( props ) {
		super( props );
		this.state = { isToggleOn: props.publishConfirmationEnabled };
		this.handleToggle = this.handleToggle.bind( this );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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
		const { translate } = this.props;

		return (
			<FormFieldset>
				<FormLabel>{ translate( 'Show publish confirmation' ) }</FormLabel>
				<FormSettingExplanation>
					{ translate(
						'The Block Editor handles the Publish confirmation setting. ' +
							'To enable it, go to Options under the Ellipses menu in the Editor ' +
							'and check "Enable Pre-publish checks."'
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
		return bindActionCreators(
			{
				savePublishConfirmationPreference: saveConfirmationSidebarPreference,
			},
			dispatch
		);
	}
)( localize( PublishConfirmation ) );
