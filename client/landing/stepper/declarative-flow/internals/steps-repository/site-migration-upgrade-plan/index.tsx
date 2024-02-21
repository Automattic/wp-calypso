import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { StepContainer } from '@automattic/onboarding';
import { UpgradePlan } from 'calypso/blocks/importer/wordpress/upgrade-plan';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationUpgradePlan: Step = function ( { navigation } ) {
	const siteItem = useSite();
	const siteSlug = useSiteSlug();
	const plan = getPlan( PLAN_BUSINESS );

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
			onCtaClick={ () => {
				goToCheckout( {
					flowName: 'site-migration',
					stepName: 'site-migration-upgrade-plan',
					siteSlug: siteSlug,
					destination: `/setup/site-migration/site-migration-instructions/?flags=onboarding/new-migration-flow&siteSlug=${ siteSlug }`,
					plan: plan.getPathSlug ? plan.getPathSlug() : '',
				} );
				navigation.submit?.( { goToCheckout: true } );
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
				hideSkip={ true }
				hideBack={ true }
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
