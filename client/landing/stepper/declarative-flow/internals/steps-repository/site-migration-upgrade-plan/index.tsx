import { PLAN_BUSINESS, getPlan, getPlanByPathSlug } from '@automattic/calypso-products';
import { StepContainer } from '@automattic/onboarding';
import { UpgradePlan } from 'calypso/blocks/importer/wordpress/upgrade-plan';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSelectedPlanUpgradeQuery } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationUpgradePlan: Step = function ( { navigation } ) {
	const siteItem = useSite();
	const siteSlug = useSiteSlug();

	const selectedPlanData = useSelectedPlanUpgradeQuery();
	const selectedPlanPathSlug = selectedPlanData.data;

	const plan = selectedPlanPathSlug
		? getPlanByPathSlug( selectedPlanPathSlug )
		: getPlan( PLAN_BUSINESS );

	if ( ! siteItem || ! siteSlug || ! plan ) {
		return;
	}

	const stepContent = (
		<UpgradePlan
			site={ siteItem }
			ctaText=""
			subTitleText=""
			isBusy={ false }
			hideTitleAndSubTitle
			sendIntentWhenCreatingTrial
			onCtaClick={ () => {
				navigation.submit?.( {
					goToCheckout: true,
					plan: plan.getPathSlug ? plan.getPathSlug() : '',
				} );
			} }
			onFreeTrialSelectionSuccess={ () => {
				navigation.submit?.( { freeTrialSelected: true } );
			} }
			navigateToVerifyEmailStep={ () => {
				navigation.submit?.( { verifyEmail: true } );
			} }
		/>
	);

	return (
		<>
			<DocumentHead title="Upgrade your plan" />
			<StepContainer
				stepName="site-migration-upgrade-plan"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-upgrade-plan"
				goBack={ navigation.goBack }
				hideSkip={ true }
				formattedHeader={
					<FormattedHeader
						id="site-migration-instructions-header"
						headerText="Upgrade your plan"
						align="center"
					/>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationUpgradePlan;
