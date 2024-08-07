import {
	PLAN_BUSINESS,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	getPlan,
	getPlanByPathSlug,
} from '@automattic/calypso-products';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { UpgradePlan } from 'calypso/blocks/importer/wordpress/upgrade-plan';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSelectedPlanUpgradeQuery } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MigrationAssistanceModal } from '../../components/migration-assistance-modal';
import type { Step } from '../../types';

const SiteMigrationUpgradePlan: Step = function ( { navigation, data } ) {
	const siteItem = useSite();
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const queryParams = useQuery();
	const hideFreeMigrationTrialForNonVerifiedEmail =
		( data?.hideFreeMigrationTrialForNonVerifiedEmail as boolean | undefined ) ?? true;

	const selectedPlanData = useSelectedPlanUpgradeQuery();
	const selectedPlanPathSlug = selectedPlanData.data;

	const plan = selectedPlanPathSlug
		? getPlanByPathSlug( selectedPlanPathSlug )
		: getPlan( PLAN_BUSINESS );

	if ( ! siteItem || ! siteSlug || ! plan ) {
		return;
	}
	const migrateFrom = queryParams.get( 'from' );
	const showMigrationModal = queryParams.get( 'showModal' );

	const goToMigrationAssistanceCheckout = ( userAcceptedDeal = false ) => {
		navigation?.submit?.( {
			goToCheckout: true,
			plan: plan.getPathSlug ? plan.getPathSlug() : '',
			userAcceptedDeal,
		} );
	};

	const customTracksEventProps = {
		from: migrateFrom,
		has_source_site: migrateFrom !== '' && migrateFrom !== null,
	};

	const stepContent = (
		<>
			{ showMigrationModal && (
				<MigrationAssistanceModal
					onConfirm={ () => {
						const userAcceptedDeal = true;
						goToMigrationAssistanceCheckout( userAcceptedDeal );
					} }
					migrateFrom={ migrateFrom }
					navigateBack={ navigation.goBack }
				/>
			) }
			<UpgradePlan
				site={ siteItem }
				ctaText={ translate( 'Upgrade and migrate' ) }
				subTitleText=""
				isBusy={ false }
				hideTitleAndSubTitle
				onCtaClick={ () => {
					const userAcceptedDeal = false;
					goToMigrationAssistanceCheckout( userAcceptedDeal );
				} }
				onFreeTrialClick={ () => {
					navigation.submit?.( {
						goToCheckout: true,
						plan: PLAN_MIGRATION_TRIAL_MONTHLY,
						sendIntentWhenCreatingTrial: true,
					} );
				} }
				navigateToVerifyEmailStep={ () => {
					navigation.submit?.( { verifyEmail: true } );
				} }
				hideFreeMigrationTrialForNonVerifiedEmail={ hideFreeMigrationTrialForNonVerifiedEmail }
				trackingEventsProps={ customTracksEventProps }
				visiblePlan={ plan.getStoreSlug() }
			/>
		</>
	);

	return (
		<>
			<DocumentHead title={ translate( 'Upgrade your plan', { textOnly: true } ) } />
			<StepContainer
				stepName="site-migration-upgrade-plan"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-upgrade-plan"
				goBack={ navigation.goBack }
				hideSkip
				formattedHeader={
					<FormattedHeader
						id="site-migration-instructions-header"
						headerText={
							hasEnTranslation( 'The plan you need' )
								? translate( 'The plan you need' )
								: translate( 'Take your site to the next level' )
						}
						subHeaderText={
							hasEnTranslation( 'Migrations are exclusive to the %(planName)s plan.' )
								? translate( 'Migrations are exclusive to the %(planName)s plan.', {
										args: {
											planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
										},
								  } )
								: translate(
										'Migrations are exclusive to the Creator plan. Check out all its benefits, and upgrade to get started.'
								  )
						}
						align="center"
						subHeaderAlign="center"
					/>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationUpgradePlan;
