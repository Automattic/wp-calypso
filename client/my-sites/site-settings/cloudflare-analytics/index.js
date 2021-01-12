/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, partialRight, pick } from 'lodash';

/**
 * Internal dependencies
 */
import wrapSettingsForm from '../wrap-settings-form';
import { Card } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import cloudflareIllustration from 'calypso/assets/images/illustrations/cloudflare-logo.svg';

/**
 * Style dependencies
 */
import './style.scss';

const validateTrackingId = ( code ) => ! code || code.match( /^(UA-\d+-\d+)|(G-[A-Z0-9]+)$/i ); // @TODO: how are cloudflare tracking IDs formatted?

export class CloudflareAnalyticsSettings extends Component {
	state = {
		isCodeValid: true,
		loggedCloudflareAnalyticsModified: false,
	};

	handleFieldChange = ( key, value ) => {
		const { fields, updateFields } = this.props;
		const updatedCloudflareFields = Object.assign( {}, fields.cloudflare || {}, {
			[ key ]: value,
		} );
		updateFields( { cloudflare: updatedCloudflareFields } );
	};

	handleCodeChange = ( event ) => {
		const code = event.target.value.trim();

		this.setState( {
			isCodeValid: validateTrackingId( code ),
		} );
		this.handleFieldChange( 'code', code );
	};

	isSubmitButtonDisabled() {
		const { isRequestingSettings, isSavingSettings } = this.props;
		return (
			isRequestingSettings ||
			isSavingSettings ||
			! this.state.isCodeValid ||
			! this.props.enableForm
		);
	}

	form() {
		const {
			enableForm,
			eventTracker,
			fields,
			handleSubmitForm,
			isRequestingSettings,
			isSavingSettings,
			path,
			translate,
			trackTracksEvent,
			uniqueEventTracker,
		} = this.props;
		const placeholderText = isRequestingSettings ? translate( 'Loading' ) : '';
		const analyticsSupportUrl = 'https://wordpress.com/support/CLOUDFLARE_SUPPORT_URL/'; // TODO: add support link

		return (
			<form id="analytics" onSubmit={ handleSubmitForm }>
				<SettingsSectionHeader
					disabled={ this.isSubmitButtonDisabled() }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton={ true }
					title={ translate( 'Cloudflare Analytics' ) }
				/>

				<Card className="cloudflare-analytics site-settings__analytics-settings">
					<div className="cloudflare-analytics site-settings__cloudflare-description">
						<div className="cloudflare-analytics site-settings__cloudflare-description-text">
							<p>
								{ translate(
									'At Cloudflare, our mission is to help build a better internet - and part of that ' +
										'is to deliver essential web analytics to everyone with a website without ' +
										'compromising user privacy. For free.'
								) }
							</p>
						</div>

						{ isDesktop() && (
							<div className="cloudflare-analytics site-settings__cloudflare-description-illustration">
								<img src={ cloudflareIllustration } alt="" />
							</div>
						) }
					</div>
					<FormFieldset>
						<FormLabel htmlFor="cloudflareCode">
							{ translate( 'Tracking ID', { context: 'site setting' } ) }
						</FormLabel>
						<FormTextInput
							name="cloudflareCode"
							id="cloudflareCode"
							value={ fields.cloudflare ? fields.cloudflare.code : '' }
							onChange={ this.handleCodeChange }
							placeholder={ placeholderText }
							disabled={ isRequestingSettings || ! enableForm }
							onFocus={ () => {
								trackTracksEvent( 'calypso_cloudflare_analytics_key_field_focused', { path } );
								eventTracker( 'Focused Analytics Key Field' )();
							} }
							onKeyPress={ () => {
								if ( ! this.state.loggedCloudflareAnalyticsModified ) {
									trackTracksEvent( 'calypso_cloudflare_analytics_key_field_modified', { path } );
									this.setState( { loggedCloudflareAnalyticsModified: true } );
								}
								uniqueEventTracker( 'Typed In Analytics Key Field' )();
							} }
							isError={ ! this.state.isCodeValid }
						/>
						{ ! this.state.isCodeValid && (
							<FormTextValidation
								isError={ true }
								text={ translate( 'Invalid Cloudflare Analytics ID.' ) }
							/>
						) }
					</FormFieldset>
					<p>
						{ translate( '{{a}}Learn more{{/a}}', {
							components: {
								a: (
									<a
										href={ localizeUrl( analyticsSupportUrl ) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</p>
				</Card>
			</form>
		);
	}

	render() {
		// we need to check that site has loaded first... a placeholder would be better,
		// but returning null is better than a fatal error for now
		if ( ! this.props.site ) {
			return null;
		}
		return this.form();
	}
}

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const sitePlugins = site ? getPlugins( state, [ site.ID ] ) : [];
	const path = getCurrentRouteParameterized( state, siteId );

	return {
		path,
		site,
		siteId,
		siteIsJetpack,
		sitePlugins,
		enableForm: true, // TODO: make this mutually exclusive with Google Analytics?
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

const connectComponent = connect( mapStateToProps, mapDispatchToProps, null, { pure: false } );

const getFormSettings = partialRight( pick, [ 'cloudflare' ] );

export default flowRight(
	connectComponent,
	wrapSettingsForm( getFormSettings )
)( CloudflareAnalyticsSettings );
