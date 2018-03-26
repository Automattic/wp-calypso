/** @format */

/**
 * External dependencies
 */
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormToggle from 'components/forms/form-toggle';
import Main from 'components/main';
import observe from 'lib/mixins/data-observe';
import { protectForm } from 'lib/protect-form';
import twoStepAuthorization from 'lib/two-step-authorization';
import ReauthRequired from 'me/reauth-required';
import formBase from 'me/form-base';
import MeSidebarNavigation from 'me/sidebar-navigation';

const TRACKS_OPT_OUT_USER_SETTINGS_KEY = 'tracks_opt_out';

const Privacy = createReactClass( {
	/**
	 * `formBase` is used for `getDisabledState` and `submitForm`
	 * `observe` is used to trigger a re-render on userSettings changes
	 */
	mixins: [ formBase, observe( 'userSettings' ) ],

	propTypes: {
		userSettings: PropTypes.object.isRequired,
	},

	updateTracksOptOut( isSendingTracksEvents ) {
		this.props.userSettings.updateSetting(
			TRACKS_OPT_OUT_USER_SETTINGS_KEY,
			! isSendingTracksEvents
		);
	},

	render() {
		const { markChanged, translate, userSettings } = this.props;

		const isSubmitButtonDisabled = ! userSettings.hasUnsavedSettings() || this.getDisabledState();

		const isSendingTracksEvent = ! this.props.userSettings.getSetting(
			TRACKS_OPT_OUT_USER_SETTINGS_KEY
		);

		return (
			<Main className="privacy">
				<DocumentHead title={ this.props.translate( 'Privacy Settings' ) } />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card className="privacy__settings">
					<form onChange={ markChanged } onSubmit={ this.submitForm }>
						<FormFieldset>
							<FormLegend>{ translate( 'Usage Statistics' ) }</FormLegend>
							<FormToggle
								id="tracks_opt_out"
								checked={ isSendingTracksEvent }
								onChange={ this.updateTracksOptOut }
							>
								{ translate( 'Send usage statistics to help us improve our products.' ) }
							</FormToggle>
						</FormFieldset>

						<FormButton
							isSubmitting={ this.state.submittingForm }
							disabled={ isSubmitButtonDisabled }
						>
							{ this.state.submittingForm
								? translate( 'Saving…' )
								: translate( 'Save Privacy Settings' ) }
						</FormButton>
					</form>
				</Card>
			</Main>
		);
	},
} );

export default compose( localize, protectForm )( Privacy );
