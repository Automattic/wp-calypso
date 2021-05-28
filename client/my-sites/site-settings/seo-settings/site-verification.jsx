/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, omit, partial } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import SupportInfo from 'calypso/components/support-info';
import ExternalLink from 'calypso/components/external-link';
import InlineSupportLink from 'calypso/components/inline-support-link';
import FormInput from 'calypso/components/forms/form-text-input-with-affixes';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import getCurrentRouteParameterized from 'calypso/state/selectors/get-current-route-parameterized';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import versionCompare from 'calypso/lib/version-compare';
import {
	isSiteSettingsSaveSuccessful,
	getSiteSettingsSaveError,
} from 'calypso/state/site-settings/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestSite } from 'calypso/state/sites/actions';
import { requestSiteSettings, saveSiteSettings } from 'calypso/state/site-settings/actions';
import { protectForm } from 'calypso/lib/protect-form';
import getSupportedServices from './services';

class SiteVerification extends Component {
	state = {
		...this.stateForSite( this.props.site ),
		dirtyFields: new Set(),
		invalidatedSiteObject: this.props.site,
	};

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
			this.props.errorNotice(
				translate( 'There was a problem saving your changes. Please, try again.' ),
				{
					id: 'site-verification-settings-error',
				}
			);
		}

		// if we are changing sites, everything goes
		if ( prevSiteId !== nextSiteId ) {
			return this.setState(
				{
					...this.stateForSite( nextSite ),
					invalidatedSiteObject: nextSite,
					dirtyFields: new Set(),
					invalidCodes: [],
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
		const supportedServices = getSupportedServices();
		const stateItems = {};

		supportedServices.forEach( ( service ) => {
			stateItems[ service.slug ] = get(
				site,
				`options.verification_services_codes.${ service.slug }`,
				''
			);
		} );
		stateItems.isFetchingSettings = get( site, 'fetchingSettings', false );

		return stateItems;
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

		if ( content.includes( '<meta' ) ) {
			// We were passed a meta tag already!
			return content;
		}
		const serviceId = getSupportedServices()
			.filter( ( item ) => item.slug === serviceName )
			.map( ( item ) => item.id )[ 0 ];

		return `<meta name="${ serviceId }" content="${ content }" />`;
	}

	isValidCode( serviceName = '', content = '' ) {
		if ( ! content.length ) {
			return true;
		}

		const serviceId = getSupportedServices()
			.filter( ( item ) => item.slug === serviceName )
			.map( ( item ) => item.id )[ 0 ];

		content = this.getMetaTag( serviceName, content );

		return content.includes( serviceId );
	}

	hasError( service ) {
		const { invalidCodes = [] } = this.state;

		return invalidCodes.includes( service );
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
					invalidCodes: [ serviceCode ],
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

		this.props.removeNotice( 'site-verification-settings-error' );

		const verificationCodes = {};
		const invalidCodes = [];
		getSupportedServices().forEach( ( service ) => {
			const verificationCode = this.state[ service.slug ];
			verificationCodes[ service.slug ] = verificationCode;
			if ( ! this.isValidCode( service.slug, verificationCode ) ) {
				invalidCodes.push( service.slug );
			}
		} );

		this.setState( { invalidCodes } );
		if ( invalidCodes.length > 0 ) {
			this.props.errorNotice( translate( 'Invalid site verification tag entered.' ), {
				id: 'site-verification-settings-error',
			} );
			return;
		}

		this.setState( {
			isSubmittingForm: true,
		} );
		const updatedOptions = {
			verification_services_codes: verificationCodes,
		};

		this.props.saveSiteSettings( siteId, updatedOptions );
		this.props.trackFormSubmitted( { path } );

		dirtyFields.forEach( ( service ) => {
			trackSiteVerificationUpdated( service, path );
		} );
	};

	render() {
		const {
			isVerificationToolsActive,
			jetpackVersion,
			siteId,
			siteIsJetpack,
			translate,
		} = this.props;
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
		const supportedServices = getSupportedServices( translate );

		supportedServices.forEach( ( service, index ) => {
			service.code = this.getMetaTag( service.slug, this.state[ service.slug ] || '' );

			if (
				service.minimumJetpackVersion &&
				jetpackVersion &&
				versionCompare( jetpackVersion, service.minimumJetpackVersion, '<=' )
			) {
				supportedServices.splice( index, 1 );
			}
		} );

		return (
			<div className="seo-settings__site-verification">
				<QuerySiteSettings siteId={ siteId } />
				{ siteIsJetpack && <QueryJetpackModules siteId={ siteId } /> }

				<SettingsSectionHeader
					disabled={ isSaveDisabled || isVerificationDisabled }
					isSaving={ isSubmittingForm }
					onButtonClick={ this.handleFormSubmit }
					showButton
					title={ translate( 'Site verification services' ) }
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
								' {{supportLink/}} if you are having trouble.',
							{
								components: {
									b: <strong />,
									supportLink: (
										<InlineSupportLink
											supportPostId={ 5022 }
											supportLink="https://wordpress.com/support/webmaster-tools/"
										>
											{ translate( 'full instructions', {
												comment: 'Full phrase: Read the full instructions',
											} ) }
										</InlineSupportLink>
									),
								},
							}
						) }
					</p>
					<p>
						{ translate( 'Supported verification services:' ) + ' ' }
						{ supportedServices
							.map( ( service ) => (
								<ExternalLink key={ service.slug } icon target="_blank" href={ service.link }>
									{ service.name }
								</ExternalLink>
							) )
							.reduce( ( prev, curr ) => [ prev, ', ', curr ] ) }
					</p>
					<form onChange={ this.props.markChanged } className="seo-settings__seo-form">
						{ supportedServices.map( ( service ) => (
							<FormFieldset key={ service.slug }>
								<FormInput
									prefix={ service.name }
									name={ `verification_code_${ service.slug }` }
									value={ service.code }
									id={ `verification_code_${ service.slug }` }
									spellCheck="false"
									disabled={ isVerificationDisabled }
									isError={ this.hasError( service.slug ) }
									placeholder={ this.getMetaTag( service.slug, '1234' ) }
									onChange={ this.handleVerificationCodeChange( service.slug ) }
								/>
								{ this.hasError( service.slug ) && this.getVerificationError( showPasteError ) }
							</FormFieldset>
						) ) }
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
			jetpackVersion: getSiteOption( state, siteId, 'jetpack_version' ),
			saveError: getSiteSettingsSaveError( state, siteId ),
			site,
			siteId,
			siteIsJetpack: isJetpackSite( state, siteId ),
			path: getCurrentRouteParameterized( state, siteId ),
		};
	},
	{
		errorNotice,
		removeNotice,
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
