/**
 * External dependencies
 */

import React, { Component } from 'react';
import notices from 'notices';
import { connect } from 'react-redux';
import { get, includes, isString, omit, partial, pickBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import SupportInfo from 'components/support-info';
import ExternalLink from 'components/external-link';
import FormInput from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import FormFieldset from 'components/forms/form-fieldset';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import QueryJetpackModules from 'components/data/query-jetpack-modules';
import QuerySiteSettings from 'components/data/query-site-settings';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import getCurrentRouteParameterized from 'state/selectors/get-current-route-parameterized';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'state/sites/selectors';
import {
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
} from 'state/site-settings/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestSite } from 'state/sites/actions';
import { requestSiteSettings, saveSiteSettings } from 'state/site-settings/actions';
import { protectForm } from 'lib/protect-form';

class SiteVerification extends Component {
	static serviceIds = {
		google: 'google-site-verification',
		bing: 'msvalidate.01',
		pinterest: 'p:domain_verify',
		yandex: 'yandex-verification',
	};

	state = {
		...this.stateForSite( this.props.site ),
		dirtyFields: new Set(),
		invalidatedSiteObject: this.props.site,
	};

	UNSAFE_componentWillMount() {
		this.changeGoogleCode = this.handleVerificationCodeChange( 'googleCode' );
		this.changeBingCode = this.handleVerificationCodeChange( 'bingCode' );
		this.changePinterestCode = this.handleVerificationCodeChange( 'pinterestCode' );
		this.changeYandexCode = this.handleVerificationCodeChange( 'yandexCode' );
	}

	componentDidMount() {
		this.refreshSite();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { siteId: prevSiteId, translate } = this.props;
		const { site: nextSite, siteId: nextSiteId } = nextProps;
		const { dirtyFields } = this.state;

		// save success
		if ( this.state.isSubmittingForm && nextProps.isSaveSuccess ) {
			this.props.markSaved();
			this.props.requestSiteSettings( nextProps.siteId );
			this.refreshSite();
			this.setState( {
				isSubmittingForm: false,
				dirtyFields: new Set(),
			} );
		}

		// save error
		if ( this.state.isSubmittingForm && nextProps.saveError ) {
			this.setState( { isSubmittingForm: false } );
			notices.error( translate( 'There was a problem saving your changes. Please, try again.' ) );
		}

		// if we are changing sites, everything goes
		if ( prevSiteId !== nextSiteId ) {
			return this.setState(
				{
					...this.stateForSite( nextSite ),
					invalidatedSiteObject: nextSite,
					dirtyFields: new Set(),
				},
				this.refreshSite
			);
		}

		let nextState = {
			...this.stateForSite( nextProps.site ),
		};

		// Don't update state for fields the user has edited
		nextState = omit( nextState, [ ...dirtyFields ] );

		this.setState( {
			...nextState,
		} );
	}

	stateForSite( site ) {
		return {
			googleCode: get( site, 'options.verification_services_codes.google', '' ),
			bingCode: get( site, 'options.verification_services_codes.bing', '' ),
			pinterestCode: get( site, 'options.verification_services_codes.pinterest', '' ),
			yandexCode: get( site, 'options.verification_services_codes.yandex', '' ),
			isFetchingSettings: get( site, 'fetchingSettings', false ),
		};
	}

	refreshSite() {
		const { site, siteId } = this.props;

		if ( site ) {
			this.setState(
				{
					invalidatedSiteObject: site,
				},
				() => this.props.requestSite( siteId )
			);
		}
	}

	getMetaTag( serviceName = '', content = '' ) {
		if ( ! content ) {
			return '';
		}

		if ( includes( content, '<meta' ) ) {
			// We were passed a meta tag already!
			return content;
		}

		return `<meta name="${ get(
			SiteVerification.serviceIds,
			serviceName,
			''
		) }" content="${ content }" />`;
	}

	isValidCode( serviceName = '', content = '' ) {
		if ( ! content.length ) {
			return true;
		}

		content = this.getMetaTag( serviceName, content );

		return includes( content, SiteVerification.serviceIds[ serviceName ] );
	}

	hasError( service ) {
		const { invalidCodes = [] } = this.state;

		return includes( invalidCodes, service );
	}

	handleVerificationCodeChange( serviceCode ) {
		return ( event ) => {
			if ( ! this.state.hasOwnProperty( serviceCode ) ) {
				return;
			}

			// Show an error if the user types into the field
			if ( event.target.value.length === 1 ) {
				this.setState( {
					showPasteError: true,
					invalidCodes: [ serviceCode.replace( 'Code', '' ) ],
				} );
				return;
			}

			const dirtyFields = new Set( this.state.dirtyFields );
			dirtyFields.add( serviceCode );

			this.setState( {
				invalidCodes: [],
				showPasteError: false,
				[ serviceCode ]: event.target.value,
				dirtyFields,
			} );
		};
	}

	getVerificationError( isPasteError ) {
		const { translate } = this.props;

		return (
			<FormInputValidation
				isError={ true }
				text={
					isPasteError
						? translate( 'Verification code should be copied and pasted into this field.' )
						: translate( 'Invalid site verification tag.' )
				}
			/>
		);
	}

	handleFormSubmit = ( event ) => {
		const { path, siteId, translate, trackSiteVerificationUpdated } = this.props;
		const { dirtyFields } = this.state;

		if ( ! event.isDefaultPrevented() && event.nativeEvent ) {
			event.preventDefault();
		}

		notices.clearNotices( 'notices' );

		const verificationCodes = {
			google: this.state.googleCode,
			bing: this.state.bingCode,
			pinterest: this.state.pinterestCode,
			yandex: this.state.yandexCode,
		};

		const filteredCodes = pickBy( verificationCodes, isString );
		const invalidCodes = Object.keys(
			pickBy( filteredCodes, ( name, content ) => ! this.isValidCode( content, name ) )
		);

		this.setState( { invalidCodes } );
		if ( invalidCodes.length > 0 ) {
			notices.error( translate( 'Invalid site verification tag entered.' ) );
			return;
		}

		this.setState( {
			isSubmittingForm: true,
		} );

		const updatedOptions = {
			verification_services_codes: filteredCodes,
		};

		this.props.saveSiteSettings( siteId, updatedOptions );
		this.props.trackFormSubmitted( { path } );

		if ( dirtyFields.has( 'googleCode' ) ) {
			trackSiteVerificationUpdated( 'google', path );
		}

		if ( dirtyFields.has( 'bingCode' ) ) {
			trackSiteVerificationUpdated( 'bing', path );
		}

		if ( dirtyFields.has( 'pinterestCode' ) ) {
			trackSiteVerificationUpdated( 'pinterest', path );
		}

		if ( dirtyFields.has( 'yandexCode' ) ) {
			trackSiteVerificationUpdated( 'yandex', path );
		}
	};

	render() {
		const { isVerificationToolsActive, siteId, siteIsJetpack, translate } = this.props;
		const {
			isSubmittingForm,
			isFetchingSettings,
			showPasteError = false,
			invalidCodes = [],
		} = this.state;
		const isDisabled = isSubmittingForm || isFetchingSettings;
		const isVerificationDisabled = isDisabled || isVerificationToolsActive === false;
		const isSaveDisabled =
			isDisabled || isSubmittingForm || ( ! showPasteError && invalidCodes.length > 0 );
		const placeholderTagContent = '1234';

		// The API returns 'false' for an empty array value, so we force it to an empty string if needed
		let { googleCode, bingCode, pinterestCode, yandexCode } = this.state;
		googleCode = this.getMetaTag( 'google', googleCode || '' );
		bingCode = this.getMetaTag( 'bing', bingCode || '' );
		pinterestCode = this.getMetaTag( 'pinterest', pinterestCode || '' );
		yandexCode = this.getMetaTag( 'yandex', yandexCode || '' );

		return (
			<div className="seo-settings__site-verification">
				<QuerySiteSettings siteId={ siteId } />
				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }

				<SettingsSectionHeader
					disabled={ isSaveDisabled || isVerificationDisabled }
					isSaving={ isSubmittingForm }
					onButtonClick={ this.handleFormSubmit }
					showButton
					title={ translate( 'Site Verification Services' ) }
				/>
				<Card>
					{ siteIsJetpack && (
						<FormFieldset>
							<SupportInfo
								text={ translate(
									'Provides the necessary hidden tags needed to verify your WordPress site with various services.'
								) }
								link="https://jetpack.com/support/site-verification-tools/"
							/>
							<JetpackModuleToggle
								siteId={ siteId }
								moduleSlug="verification-tools"
								label={ translate( 'Verify site ownership with third-party services' ) }
								disabled={ isDisabled }
							/>
						</FormFieldset>
					) }

					<p>
						{ translate(
							'Note that {{b}}verifying your site with these services is not necessary{{/b}} in order' +
								' for your site to be indexed by search engines. To use these advanced search engine tools' +
								' and verify your site with a service, paste the HTML Tag code below. Read the' +
								' {{support}}full instructions{{/support}} if you are having trouble. Supported verification services:' +
								' {{google}}Google Search Console{{/google}}, {{bing}}Bing Webmaster Center{{/bing}},' +
								' {{pinterest}}Pinterest Site Verification{{/pinterest}}, and {{yandex}}Yandex.Webmaster{{/yandex}}.',
							{
								components: {
									b: <strong />,
									support: (
										<ExternalLink
											icon={ true }
											target="_blank"
											href="https://wordpress.com/support/webmaster-tools/"
										/>
									),
									google: (
										<ExternalLink
											icon={ true }
											target="_blank"
											href="https://www.google.com/webmasters/tools/"
										/>
									),
									bing: (
										<ExternalLink
											icon={ true }
											target="_blank"
											href="https://www.bing.com/webmaster/"
										/>
									),
									pinterest: (
										<ExternalLink
											icon={ true }
											target="_blank"
											href="https://pinterest.com/website/verify/"
										/>
									),
									yandex: (
										<ExternalLink
											icon={ true }
											target="_blank"
											href="https://webmaster.yandex.com/sites/"
										/>
									),
								},
							}
						) }
					</p>
					<form onChange={ this.props.markChanged } className="seo-settings__seo-form">
						<FormFieldset>
							<FormInput
								prefix={ translate( 'Google' ) }
								name="verification_code_google"
								type="text"
								value={ googleCode }
								id="verification_code_google"
								spellCheck="false"
								disabled={ isVerificationDisabled }
								isError={ this.hasError( 'google' ) }
								placeholder={ this.getMetaTag( 'google', placeholderTagContent ) }
								onChange={ this.changeGoogleCode }
							/>
							{ this.hasError( 'google' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ translate( 'Bing' ) }
								name="verification_code_bing"
								type="text"
								value={ bingCode }
								id="verification_code_bing"
								spellCheck="false"
								disabled={ isVerificationDisabled }
								isError={ this.hasError( 'bing' ) }
								placeholder={ this.getMetaTag( 'bing', placeholderTagContent ) }
								onChange={ this.changeBingCode }
							/>
							{ this.hasError( 'bing' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ translate( 'Pinterest' ) }
								name="verification_code_pinterest"
								type="text"
								value={ pinterestCode }
								id="verification_code_pinterest"
								spellCheck="false"
								disabled={ isVerificationDisabled }
								isError={ this.hasError( 'pinterest' ) }
								placeholder={ this.getMetaTag( 'pinterest', placeholderTagContent ) }
								onChange={ this.changePinterestCode }
							/>
							{ this.hasError( 'pinterest' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
						<FormFieldset>
							<FormInput
								prefix={ translate( 'Yandex' ) }
								name="verification_code_yandex"
								type="text"
								value={ yandexCode }
								id="verification_code_yandex"
								spellCheck="false"
								disabled={ isVerificationDisabled }
								isError={ this.hasError( 'yandex' ) }
								placeholder={ this.getMetaTag( 'yandex', placeholderTagContent ) }
								onChange={ this.changeYandexCode }
							/>
							{ this.hasError( 'yandex' ) && this.getVerificationError( showPasteError ) }
						</FormFieldset>
					</form>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );

		return {
			isSaveSuccess: isSiteSettingsSaveSuccessful( state, siteId ),
			isVerificationToolsActive: isJetpackModuleActive( state, siteId, 'verification-tools' ),
			saveError: getSiteSettingsSaveError( state, siteId ),
			site,
			siteId,
			siteIsJetpack: isJetpackSite( state, siteId ),
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{
		requestSite,
		requestSiteSettings,
		saveSiteSettings,
		trackSiteVerificationUpdated: ( service, path ) =>
			recordTracksEvent( 'calypso_seo_tools_site_verification_updated', {
				service,
				path,
			} ),
		trackFormSubmitted: partial( recordTracksEvent, 'calypso_seo_settings_form_submit' ),
	},
	undefined,
	{ pure: false } // defaults to true, but this component has internal state
)( protectForm( localize( SiteVerification ) ) );
