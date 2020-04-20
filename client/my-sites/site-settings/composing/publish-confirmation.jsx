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
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import QueryPreferences from 'components/data/query-preferences';
import { isFetchingPreferences } from 'state/preferences/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isConfirmationSidebarEnabled } from 'state/ui/editor/selectors';
import { saveConfirmationSidebarPreference } from 'state/ui/editor/actions';
import { shouldLoadGutenberg } from 'state/selectors/should-load-gutenberg';

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
		const { fetchingPreferences, translate, showPublishFlow } = this.props;

		if ( showPublishFlow ) {
			return (
				<FormFieldset>
					<FormLabel>{ translate( 'Show Publish Confirmation' ) }</FormLabel>
					<FormSettingExplanation isIndented>
						{ translate(
							'The Block Editor handles the Publish confirmation setting. ' +
								'To enable it, go to Options under the Ellipses menu in the Editor ' +
								'and check "Enable Pre-publish checks."'
						) }
					</FormSettingExplanation>
				</FormFieldset>
			);
		}

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
			showPublishFlow: shouldLoadGutenberg( state, siteId ),
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
