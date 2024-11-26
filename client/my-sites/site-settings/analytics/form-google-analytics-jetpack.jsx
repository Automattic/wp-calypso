import {
	FEATURE_GOOGLE_ANALYTICS,
	PLAN_JETPACK_SECURITY_DAILY,
} from '@automattic/calypso-products';
import {
	FormInputValidation as FormTextValidation,
	FormLabel,
	Button,
} from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { find } from 'lodash';
import { useEffect } from 'react';
import googleIllustration from 'calypso/assets/images/illustrations/google-analytics-logo.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import ExternalLink from 'calypso/components/external-link';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { PanelHeading, PanelSection } from 'calypso/components/panel';
import SupportInfo from 'calypso/components/support-info';
import { PRODUCT_UPSELLS_BY_FEATURE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestSiteSettings } from 'calypso/state/site-settings/actions';
import FormAnalyticsStores from '../form-analytics-stores';

import './style.scss';

const GoogleAnalyticsJetpackForm = ( {
	displayForm,
	enableForm,
	fields,
	handleCodeChange,
	handleFieldChange,
	handleFieldFocus,
	handleFieldKeypress,
	handleSubmitForm,
	isCodeValid,
	isRequestingSettings,
	isSavingSettings,
	isSubmitButtonDisabled,
	jetpackModuleActive,
	path,
	placeholderText,
	recordSupportLinkClick,
	setDisplayForm,
	showUpgradeNudge,
	site,
	siteId,
	sitePlugins,
	translate,
	isAtomic,
	isJetpackModuleAvailable,
} ) => {
	const upsellHref = `/checkout/${ site.slug }/${ PRODUCT_UPSELLS_BY_FEATURE[ FEATURE_GOOGLE_ANALYTICS ] }`;
	const analyticsSupportUrl = isAtomic
		? localizeUrl( 'https://wordpress.com/support/google-analytics/' )
		: 'https://jetpack.com/support/google-analytics/';
	const nudgeTitle = translate( 'Connect your site to Google Analytics' );
	// TODO: it would be better to get wooCommercePlugin directly in form-google-analytics using getAllPluginsIndexedByPluginSlug
	const wooCommercePlugin = find( sitePlugins, { slug: 'woocommerce' } );
	const wooCommerceActive = wooCommercePlugin ? wooCommercePlugin.sites[ siteId ].active : false;
	const dispatch = useDispatch();
	const trackTracksEvent = ( name, props ) => dispatch( recordTracksEvent( name, props ) );

	useEffect( () => {
		// Show the form if GA module is active, or it's been removed but GA is activated via the Legacy Plugin.
		if ( jetpackModuleActive || ( ! isJetpackModuleAvailable && fields?.wga?.is_active ) ) {
			setDisplayForm( true );
		} else {
			setDisplayForm( false );
		}
	}, [ jetpackModuleActive, setDisplayForm, isJetpackModuleAvailable, fields?.wga?.is_active ] );

	useEffect( () => {
		if ( jetpackModuleActive && ! fields.hasOwnProperty( 'wga' ) ) {
			dispatch( requestSiteSettings( siteId ) );
		}
	}, [ jetpackModuleActive, siteId ] );

	const handleToggleChange = ( key ) => {
		const value = fields.wga ? ! fields.wga[ key ] : false;
		trackTracksEvent( 'calypso_google_analytics_setting_changed', { key, path } );
		handleFieldChange( key, value );
	};

	const handleAnonymizeChange = () => {
		handleToggleChange( 'anonymize_ip' );
	};

	const handleSubmitFormCustom = () => {
		if ( isJetpackModuleAvailable ) {
			handleFieldChange( 'is_active', !! jetpackModuleActive, handleSubmitForm );
			return;
		}

		handleSubmitForm();
	};

	const trackActiveToggle = () => {
		trackTracksEvent( 'calypso_google_analytics_setting_changed', { key: 'is_active', path } );
	};

	const handleSettingsToggleChange = ( value ) => {
		trackActiveToggle();
		handleFieldChange( 'is_active', value, handleSubmitForm );
	};

	const renderSettingsToggle = () => {
		return (
			<span className="jetpack-module-toggle">
				<ToggleControl
					id={ `${ siteId }-ga-settings-toggle` }
					checked={ fields?.wga?.is_active }
					onChange={ handleSettingsToggleChange }
					label={ translate( 'Add Google' ) }
					disabled={ isRequestingSettings || isSavingSettings }
				/>
			</span>
		);
	};

	const renderForm = () => {
		return (
			<form
				aria-label="Google Analytics Site Settings"
				id="analytics"
				onSubmit={ handleSubmitFormCustom }
			>
				<QueryJetpackModules siteId={ siteId } />

				<>
					<PanelHeading>{ translate( 'Google Analytics' ) }</PanelHeading>
					<div className="analytics site-settings__analytics">
						<div className="analytics site-settings__analytics-illustration">
							<img src={ googleIllustration } alt="" />
						</div>
						<div className="analytics site-settings__analytics-text">
							<p>
								{ translate(
									'A free analytics tool that offers additional insights into your site.'
								) }{ ' ' }
								<a
									onClick={ recordSupportLinkClick }
									href={ analyticsSupportUrl }
									target="_blank"
									rel="noreferrer"
								>
									{ translate( 'Learn more' ) }
								</a>
							</p>
						</div>
					</div>
					{ displayForm && (
						<div className="analytics site-settings__analytics-form-content">
							<FormFieldset>
								<FormLabel htmlFor="wgaCode">
									{ translate( 'Google Analytics Measurement ID', { context: 'site setting' } ) }
								</FormLabel>
								<FormTextInput
									name="wgaCode"
									id="wgaCode"
									value={ fields.wga ? fields.wga.code : '' }
									onChange={ handleCodeChange }
									placeholder={ placeholderText }
									disabled={ isRequestingSettings || ! enableForm }
									onFocus={ handleFieldFocus }
									onKeyPress={ handleFieldKeypress }
									isError={ ! isCodeValid }
								/>
								{ ! isCodeValid && (
									<FormTextValidation
										isError
										text={ translate( 'Invalid Google Analytics Measurement ID.' ) }
									/>
								) }
								<InlineSupportLink supportContext="google-analytics-measurement-id">
									{ translate( 'Where can I find my Measurement ID?' ) }
								</InlineSupportLink>
							</FormFieldset>
							<FormFieldset>
								<ToggleControl
									checked={ fields.wga ? Boolean( fields.wga.anonymize_ip ) : false }
									disabled={ isRequestingSettings || ! enableForm }
									onChange={ handleAnonymizeChange }
									label={ translate( 'Anonymize IP addresses' ) }
								/>
								<FormSettingExplanation>
									{ translate(
										'Enabling this option is mandatory in certain countries due to national ' +
											'privacy laws.'
									) }
									<ExternalLink
										icon
										href="https://support.google.com/analytics/answer/2763052"
										target="_blank"
										rel="noopener noreferrer"
									>
										{ translate( 'Learn more' ) }
									</ExternalLink>
								</FormSettingExplanation>
							</FormFieldset>
							{ wooCommerceActive && (
								<FormAnalyticsStores fields={ fields } handleToggleChange={ handleToggleChange } />
							) }
							<p>
								{ translate(
									'Google Analytics is a free service that complements our {{a}}built-in stats{{/a}} ' +
										'with different insights into your traffic. Jetpack Stats and Google Analytics ' +
										'use different methods to identify and track activity on your site, so they will ' +
										'normally show slightly different totals for your visits, views, etc.',
									{
										components: {
											a: <a href={ '/stats/' + site.domain } />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									'Learn more about using {{a}}Google Analytics with WordPress.com{{/a}}.',
									{
										components: {
											a: (
												<a href={ analyticsSupportUrl } target="_blank" rel="noopener noreferrer" />
											),
										},
									}
								) }
							</p>
						</div>
					) }
				</>
				{ showUpgradeNudge && site && site.plan ? (
					<UpsellNudge
						description={ translate(
							"Monitor your site's views, clicks, and other important metrics"
						) }
						event="google_analytics_settings"
						feature={ FEATURE_GOOGLE_ANALYTICS }
						plan={ PLAN_JETPACK_SECURITY_DAILY }
						href={ upsellHref }
						showIcon
						title={ nudgeTitle }
					/>
				) : (
					<>
						<div className="analytics site-settings__analytics">
							<FormFieldset>
								<SupportInfo
									text={ translate(
										'Reports help you track the path visitors take' +
											' through your site, and goal conversion lets you' +
											' measure how visitors complete specific tasks.'
									) }
									link="https://jetpack.com/support/google-analytics/"
								/>
								{ isJetpackModuleAvailable ? (
									<JetpackModuleToggle
										siteId={ siteId }
										moduleSlug="google-analytics"
										label={ translate( 'Add Google' ) }
										disabled={ isRequestingSettings || isSavingSettings }
										onChange={ trackActiveToggle }
									/>
								) : (
									renderSettingsToggle()
								) }
							</FormFieldset>
						</div>

						<Button
							className="is-primary"
							disabled={ isSubmitButtonDisabled }
							busy={ isSavingSettings }
							onClick={ handleSubmitFormCustom }
						>
							{ translate( 'Save' ) }
						</Button>
					</>
				) }
			</form>
		);
	};

	// we need to check that site has loaded first... a placeholder would be better,
	// but returning null is better than a fatal error for now
	if ( ! site ) {
		return null;
	}
	return <PanelSection>{ renderForm() }</PanelSection>;
};
export default GoogleAnalyticsJetpackForm;
