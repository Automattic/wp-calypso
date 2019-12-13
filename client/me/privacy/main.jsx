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
import { Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import ExternalLink from 'components/external-link';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle';
import Main from 'components/main';
import observe from 'lib/mixins/data-observe'; //eslint-disable-line no-restricted-imports
import { protectForm } from 'lib/protect-form';
import { localizeUrl } from 'lib/i18n-utils';
import twoStepAuthorization from 'lib/two-step-authorization';
import ReauthRequired from 'me/reauth-required';
import SectionHeader from 'components/section-header';
import formBase from 'me/form-base';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

const TRACKS_OPT_OUT_USER_SETTINGS_KEY = 'tracks_opt_out';

/* eslint-disable react/prefer-es6-class */
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
			<ExternalLink href={ localizeUrl( 'https://automattic.com/cookies' ) } target="_blank" />
		);
		const privacyPolicyLink = (
			<ExternalLink href={ localizeUrl( 'https://automattic.com/privacy' ) } target="_blank" />
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
						<FormFieldset>
							<p>{ translate( 'We are committed to your privacy and security.' ) }</p>
							<p>
								{ translate(
									'The information you choose to share helps us improve our products, make marketing to you more ' +
										'relevant, personalize your WordPress.com experience, and more as detailed in ' +
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
									'In addition to our analytics tool, we use other tracking tools, including some from third parties. ' +
										'{{cookiePolicyLink}}Read about these{{/cookiePolicyLink}} and how to ' +
										'control them.',
									{
										components: {
											cookiePolicyLink,
										},
									}
								) }
							</p>
							<hr />
							<p>
								<FormToggle
									id="tracks_opt_out"
									checked={ isSendingTracksEvent }
									onChange={ this.updateTracksOptOut }
								>
									{ translate(
										'Share information with our analytics tool about your use of services while ' +
											'logged in to your WordPress.com account. {{cookiePolicyLink}}Learn more' +
											'{{/cookiePolicyLink}}.',
										{
											components: {
												cookiePolicyLink,
											},
										}
									) }
								</FormToggle>
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
