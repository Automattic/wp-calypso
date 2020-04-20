/**
 * External dependencies
 */
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
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
import { requestHttpData, getHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import { successNotice, errorNotice } from 'state/notices/actions';

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
								: translate( 'Save privacy settings' ) }
						</FormButton>
					</form>
				</Card>
				<SectionHeader
					label={ translate( 'Data Processing Addendum', {
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
					<Button primary className="privacy__dpa-request-button" onClick={ this.props.requestDpa }>
						{ translate( 'Request a DPA', {
							comment:
								'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
						} ) }
					</Button>
				</Card>
			</Main>
		);
	},
} );

const dpaRequestId = 'dpa-request';
function requestDpa() {
	requestHttpData(
		dpaRequestId,
		http( {
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: '/me/request-dpa',
		} ),
		{
			freshness: -Infinity, // we want to allow the user to re-request
			fromApi: () => () => [ [ dpaRequestId, true ] ],
		}
	);
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
	protectForm,
	connect(
		() => ( {
			dpaRequest: dpaRequestState( getHttpData( dpaRequestId ) ),
		} ),
		( dispatch ) => ( {
			requestDpa,
			successNotice: ( message ) => dispatch( successNotice( message ) ),
			errorNotice: ( message ) => dispatch( errorNotice( message ) ),
		} )
	)
)( Privacy );
