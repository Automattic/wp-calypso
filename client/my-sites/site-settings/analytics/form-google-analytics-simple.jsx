import {
	findFirstSimilarPlanKey,
	FEATURE_GOOGLE_ANALYTICS,
	TYPE_PREMIUM,
	getPlan,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import {
	FormInputValidation as FormTextValidation,
	FormLabel,
	Button,
} from '@automattic/components';
import { useSelector } from 'react-redux';
import googleIllustration from 'calypso/assets/images/illustrations/google-analytics-logo.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';

import './style.scss';

const GoogleAnalyticsSimpleForm = ( {
	enableForm,
	fields,
	handleCodeChange,
	handleFieldFocus,
	handleFieldKeypress,
	handleSubmitForm,
	isCodeValid,
	isRequestingSettings,
	isSavingSettings,
	isSubmitButtonDisabled,
	placeholderText,
	showUpgradeNudge,
	site,
	siteId,
	translate,
} ) => {
	const nudgeTitle = translate(
		'Connect your site to Google Analytics in seconds with the %(premiumPlanName)s plan',
		{ args: { premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle() } }
	);
	const statsUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=stats' )
	);

	const displayForm = ! showUpgradeNudge || !! fields?.wga?.code;

	const renderForm = () => {
		const plan = findFirstSimilarPlanKey( site.plan.product_slug, {
			type: TYPE_PREMIUM,
		} );

		const nudge = (
			<UpsellNudge
				description={ translate(
					"Add your unique Measurement ID to monitor your site's performance in Google Analytics."
				) }
				event="google_analytics_settings"
				feature={ FEATURE_GOOGLE_ANALYTICS }
				plan={ plan }
				showIcon
				title={ nudgeTitle }
			/>
		);
		return (
			<form
				aria-label="Google Analytics Site Settings"
				id="analytics"
				onSubmit={ handleSubmitForm }
			>
				<>
					<PanelCardHeading>{ translate( 'Google Analytics' ) }</PanelCardHeading>
					<div className="analytics site-settings__analytics">
						<div className="analytics site-settings__analytics-illustration">
							<img src={ googleIllustration } alt="" />
						</div>
						<div className="analytics site-settings__analytics-text">
							<p>
								{ translate( 'Free analytics that works alongside {{a}}Jetpack Stats{{/a}}.', {
									components: {
										a: <a href={ statsUrl } />,
									},
								} ) }
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
								<InlineSupportLink
									supportContext="google-analytics-measurement-id"
									tracksEvent="calypso_traffic_settings_google_support_click"
								>
									{ translate( 'Where can I find my Measurement ID?' ) }
								</InlineSupportLink>
							</FormFieldset>
						</div>
					) }
				</>
				{ showUpgradeNudge && site && site.plan ? (
					nudge
				) : (
					<Button
						className="is-primary"
						disabled={ isSubmitButtonDisabled }
						busy={ isSavingSettings }
						onClick={ handleSubmitForm }
					>
						{ translate( 'Save' ) }
					</Button>
				) }
			</form>
		);
	};

	// we need to check that site has loaded first... a placeholder would be better,
	// but returning null is better than a fatal error for now
	if ( ! site ) {
		return null;
	}
	return <PanelCard>{ renderForm() }</PanelCard>;
};

export default GoogleAnalyticsSimpleForm;
