/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { withLocalizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DocumentHead from 'calypso/components/data/document-head';
import ExternalLink from 'calypso/components/external-link';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import Main from 'calypso/components/main';
import { protectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import SectionHeader from 'calypso/components/section-header';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FormattedHeader from 'calypso/components/formatted-header';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { setUserSetting, saveUserSettings } from 'calypso/state/user-settings/actions';
import hasUnsavedUserSettings from 'calypso/state/selectors/has-unsaved-user-settings';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import DPA from './dpa';

const TRACKS_OPT_OUT_USER_SETTINGS_KEY = 'tracks_opt_out';

class Privacy extends React.Component {
	componentDidUpdate( oldProps ) {
		if ( oldProps.hasUnsavedUserSettings && ! this.props.hasUnsavedUserSettings ) {
			this.props.markSaved();
		}
	}

	updateTracksOptOut = ( isSendingTracksEvents ) => {
		this.props.setUserSetting( TRACKS_OPT_OUT_USER_SETTINGS_KEY, ! isSendingTracksEvents );
	};

	submitForm = ( event ) => {
		event.preventDefault();

		this.props.saveUserSettings();
	};

	render() {
		const {
			markChanged,
			translate,
			/* eslint-disable no-shadow */
			hasUnsavedUserSettings,
			isUpdatingUserSettings,
			/* eslint-enable no-shadow */
			localizeUrl,
		} = this.props;

		const isSubmitButtonDisabled = ! hasUnsavedUserSettings || isUpdatingUserSettings;

		const cookiePolicyLink = (
			<ExternalLink href={ localizeUrl( 'https://automattic.com/cookies' ) } target="_blank" />
		);
		const privacyPolicyLink = (
			<ExternalLink href={ localizeUrl( 'https://automattic.com/privacy' ) } target="_blank" />
		);

		return (
			<Main wideLayout className="privacy">
				<QueryUserSettings />
				<PageViewTracker path="/me/privacy" title="Me > Privacy" />
				<DocumentHead title={ translate( 'Privacy Settings' ) } />
				<MeSidebarNavigation />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<FormattedHeader brandFont headerText={ translate( 'Privacy' ) } align="left" />

				<SectionHeader label={ translate( 'Usage information' ) } />
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
							<ToggleControl
								id="tracks_opt_out"
								checked={ ! this.props.tracksOptOut }
								onChange={ this.updateTracksOptOut }
								label={ translate(
									'Share information with our analytics tool about your use of services while ' +
										'logged in to your WordPress.com account. {{cookiePolicyLink}}Learn more' +
										'{{/cookiePolicyLink}}.',
									{
										components: {
											cookiePolicyLink,
										},
									}
								) }
							/>
						</FormFieldset>

						<FormButton isSubmitting={ isUpdatingUserSettings } disabled={ isSubmitButtonDisabled }>
							{ isUpdatingUserSettings
								? translate( 'Saving…' )
								: translate( 'Save privacy settings' ) }
						</FormButton>
					</form>
				</Card>
				<DPA />
			</Main>
		);
	}
}

export default compose(
	localize,
	withLocalizeUrl,
	protectForm,
	connect(
		( state ) => ( {
			tracksOptOut: getUserSetting( state, TRACKS_OPT_OUT_USER_SETTINGS_KEY ) ?? true,
			hasUnsavedUserSettings: hasUnsavedUserSettings( state ),
			isUpdatingUserSettings: isUpdatingUserSettings( state ),
		} ),
		{ setUserSetting, saveUserSettings }
	)
)( Privacy );
