import {
	findFirstSimilarPlanKey,
	FEATURE_GOOGLE_ANALYTICS,
	TYPE_PREMIUM,
} from '@automattic/calypso-products';
import { CompactCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useEffect } from 'react';
import googleIllustration from 'calypso/assets/images/illustrations/google-analytics-logo.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';

import './style.scss';

const GoogleAnalyticsSimpleForm = ( {
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
	placeholderText,
	recordSupportLinkClick,
	setDisplayForm,
	showUpgradeNudge,
	site,
	translate,
} ) => {
	const analyticsSupportUrl = localizeUrl( 'https://wordpress.com/support/google-analytics/' );
	const nudgeTitle = translate(
		'Connect your site to Google Analytics in seconds with the Pro plan'
	);

	useEffect( () => {
		if ( fields?.wga?.code ) {
			setDisplayForm( true );
		} else {
			setDisplayForm( false );
		}
	}, [ fields, setDisplayForm ] );

	const handleFormToggle = () => {
		if ( displayForm ) {
			setDisplayForm( false );
			handleFieldChange( 'code', '', () => {
				handleSubmitForm();
			} );
		} else {
			setDisplayForm( true );
		}
	};

	const renderForm = () => {
		const plan = findFirstSimilarPlanKey( site.plan.product_slug, {
			type: TYPE_PREMIUM,
		} );

		const nudge = (
			<UpsellNudge
				description={ translate(
					"Add your unique Measurement ID to monitor your site's performance in Google Analytics."
				) }
				event={ 'google_analytics_settings' }
				feature={ FEATURE_GOOGLE_ANALYTICS }
				plan={ plan }
				showIcon={ true }
				title={ nudgeTitle }
			/>
		);
		return (
			<form id="analytics" onSubmit={ handleSubmitForm }>
				<SettingsSectionHeader
					disabled={ isSubmitButtonDisabled }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Google' ) }
				/>

				<CompactCard>
					<div className="analytics site-settings__analytics">
						<div className="analytics site-settings__analytics-illustration">
							<img src={ googleIllustration } alt="" />
						</div>
						<div className="analytics site-settings__analytics-text">
							<p className="analytics site-settings__analytics-title">
								{ translate( 'Google Analytics' ) }
							</p>
							<p>
								{ translate(
									'A free analytics tool that offers additional insights into your site.'
								) }
							</p>
							<p>
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
										isError={ true }
										text={ translate( 'Invalid Google Analytics Measurement ID.' ) }
									/>
								) }
								<InlineSupportLink supportContext="google-analytics-measurement-id">
									{ translate( 'Where can I find my Measurement ID?' ) }
								</InlineSupportLink>
							</FormFieldset>
							<p>
								{ translate(
									'Google Analytics is a free service that complements our {{a}}built-in stats{{/a}} ' +
										'with different insights into your traffic. WordPress.com stats and Google Analytics ' +
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
				</CompactCard>
				{ showUpgradeNudge && site && site.plan ? (
					nudge
				) : (
					<CompactCard>
						<div className="analytics site-settings__analytics">
							<ToggleControl
								checked={ displayForm }
								disabled={ isRequestingSettings || isSavingSettings }
								onChange={ handleFormToggle }
								label={ translate( 'Add Google' ) }
							/>
						</div>
					</CompactCard>
				) }
				<div className="analytics site-settings__analytics-spacer" />
			</form>
		);
	};

	// we need to check that site has loaded first... a placeholder would be better,
	// but returning null is better than a fatal error for now
	if ( ! site ) {
		return null;
	}
	return renderForm();
};

export default GoogleAnalyticsSimpleForm;
