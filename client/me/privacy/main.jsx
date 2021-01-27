/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { withLocalizeUrl } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import DocumentHead from 'calypso/components/data/document-head';
import ExternalLink from 'calypso/components/external-link';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormToggle from 'calypso/components/forms/form-toggle';
import Main from 'calypso/components/main';
import { protectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import SectionHeader from 'calypso/components/section-header';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getHttpData } from 'calypso/state/data-layer/http-data';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import FormattedHeader from 'calypso/components/formatted-header';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { setUserSetting, saveUserSettings } from 'calypso/state/user-settings/actions';
import hasUnsavedUserSettings from 'calypso/state/selectors/has-unsaved-user-settings';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import requestDpa from 'calypso/state/data-getters/request-dpa';

const TRACKS_OPT_OUT_USER_SETTINGS_KEY = 'tracks_opt_out';

const dpaRequestId = 'dpa-request';

class Privacy extends React.Component {
	componentDidUpdate( oldProps ) {
		const { dpaRequest, translate } = this.props;
		const { dpaRequest: oldDpaRequest } = oldProps;

		if ( dpaRequest.status === 'success' && dpaRequest.status !== oldDpaRequest.status ) {
			this.props.successNotice(
				translate( 'Request successful! We are sending you our DPA via email', {
					comment:
						'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
				} )
			);
		} else if ( dpaRequest.status === 'failure' && dpaRequest.error && ! oldDpaRequest.error ) {
			this.props.errorNotice(
				dpaRequest.error.error === 'too_many_requests'
					? dpaRequest.error.message
					: translate( 'There was an error requesting a DPA', {
							comment:
								'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
					  } )
			);
		}

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
			<Main className="privacy is-wide-layout">
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
							<FormToggle
								id="tracks_opt_out"
								checked={ ! this.props.tracksOptOut }
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
						</FormFieldset>

						<FormButton isSubmitting={ isUpdatingUserSettings } disabled={ isSubmitButtonDisabled }>
							{ isUpdatingUserSettings
								? translate( 'Saving…' )
								: translate( 'Save privacy settings' ) }
						</FormButton>
					</form>
				</Card>
				<SectionHeader
					label={ translate( 'Data processing addendum', {
						comment:
							'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
					} ) }
				/>
				<Card>
					<p>
						{ translate(
							'A Data Processing Addendum (DPA) allows web sites and companies to assure customers, vendors, ' +
								'and partners that their data handling complies with the law.'
						) }
					</p>

					<p>
						{ translate( 'Note: most free site owners or hobbyists do not need a DPA.', {
							comment:
								'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
						} ) }
					</p>

					<p>
						<strong>
							{ translate(
								'Having a DPA does not change any of our privacy and security practices for site visitors. ' +
									'Everyone using our service gets the same high standards of privacy and security.',
								{
									comment:
										'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
								}
							) }
						</strong>
					</p>
					<Button
						className="privacy__dpa-request-button"
						onClick={ () => requestDpa( dpaRequestId ) }
					>
						{ translate( 'Request a DPA', {
							comment:
								'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
						} ) }
					</Button>
				</Card>
			</Main>
		);
	}
}

const dpaRequestState = ( request ) => {
	switch ( request.state ) {
		case 'pending':
			return { status: 'pending' };
		case 'success':
			return { status: 'success' };
		case 'failure':
			return { status: 'failure', error: request.error };
		default:
			return { status: 'unsent' };
	}
};

export default compose(
	localize,
	withLocalizeUrl,
	protectForm,
	connect(
		( state ) => ( {
			dpaRequest: dpaRequestState( getHttpData( dpaRequestId ) ),
			tracksOptOut: getUserSetting( state, TRACKS_OPT_OUT_USER_SETTINGS_KEY ) ?? true,
			hasUnsavedUserSettings: hasUnsavedUserSettings( state ),
			isUpdatingUserSettings: isUpdatingUserSettings( state ),
		} ),
		{ successNotice, errorNotice, setUserSetting, saveUserSettings }
	)
)( Privacy );
