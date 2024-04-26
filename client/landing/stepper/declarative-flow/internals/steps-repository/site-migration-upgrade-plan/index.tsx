import { PLAN_BUSINESS, getPlan, getPlanByPathSlug } from '@automattic/calypso-products';
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
	const queryParams = useQuery();
	const hideFreeMigrationTrialForNonVerifiedEmail =
		( data?.hideFreeMigrationTrialForNonVerifiedEmail as boolean | undefined ) ?? false;

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

	const goToMigrationAssistanceCheckout = () => {
		navigation?.submit?.( {
			goToCheckout: true,
			plan: plan.getPathSlug ? plan.getPathSlug() : '',
		} );
	};

	const stepContent = (
		<>
			{ showMigrationModal && (
				<MigrationAssistanceModal
					onConfirm={ goToMigrationAssistanceCheckout }
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
				sendIntentWhenCreatingTrial
				onCtaClick={ goToMigrationAssistanceCheckout }
				onFreeTrialSelectionSuccess={ () => {
					navigation.submit?.( { freeTrialSelected: true } );
				} }
				navigateToVerifyEmailStep={ () => {
					navigation.submit?.( { verifyEmail: true } );
				} }
				hideFreeMigrationTrialForNonVerifiedEmail={ hideFreeMigrationTrialForNonVerifiedEmail }
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
				hideSkip={ true }
				formattedHeader={
					<FormattedHeader
						id="site-migration-instructions-header"
						headerText={ translate( 'Take your site to the next level' ) }
						subHeaderText={ translate(
							'Migrations are exclusive to the Creator plan. Check out all its benefits, and upgrade to get started.'
						) }
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
