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
import FormToggle from 'components/forms/form-toggle';
import Main from 'components/main';
import observe from 'lib/mixins/data-observe';
import { protectForm } from 'lib/protect-form';
import twoStepAuthorization from 'lib/two-step-authorization';
import ReauthRequired from 'me/reauth-required';
import SectionHeader from 'components/section-header';
import formBase from 'me/form-base';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';

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

		const cookiePolicyLink = (
			<a href="https://www.automattic.com/cookies" target="_blank" rel="noopener noreferrer" />
		);
		const privacyPolicyLink = (
			<a href="https://www.automattic.com/privacy" target="_blank" rel="noopener noreferrer" />
		);

		return (
			<Main className="privacy">
				<PageViewTracker path="/me/privacy" title="Me > Privacy" />
				<DocumentHead title={ translate( 'Privacy Settings' ) } />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<SectionHeader label={ translate( 'Usage Information' ) } />
				<Card className="privacy__settings">
					<form onChange={ markChanged } onSubmit={ this.submitForm }>
						<p>{ translate( 'We are committed to your privacy and security.' ) }</p>

						<FormFieldset>
							<p>
								<FormToggle
									id="tracks_opt_out"
									checked={ isSendingTracksEvent }
									onChange={ this.updateTracksOptOut }
								>
									{ translate(
										// eslint-disable-next-line max-len
										'Allow us to collect information about how you use your services while you ' +
											'are logged in to your WordPress.com account through our own first-party ' +
											'analytics tool. {{cookiePolicyLink}}Learn more{{/cookiePolicyLink}}',
										{
											components: {
												cookiePolicyLink,
											},
										}
									) }
								</FormToggle>
							</p>

							<p>
								{ translate(
									// eslint-disable-next-line max-len
									'We use this information to improve our products, make our marketing to you more ' +
										'relevant, personalize your experience, and for the other purposes described in ' +
										'our {{privacyPolicyLink}}privacy policy{{/privacyPolicyLink}}.',
									{
										components: {
											privacyPolicyLink,
										},
									}
								) }
							</p>

							<p>
								{ translate(
									// eslint-disable-next-line max-len
									'We use other tracking technologies and cookies, including some from third ' +
										'parties. {{cookiePolicyLink}}Learn more{{/cookiePolicyLink}} about these ' +
										'technologies and your options to control them.',
									{
										components: {
											cookiePolicyLink,
										},
									}
								) }
							</p>
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
