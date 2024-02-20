import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { UpgradePlan } from 'calypso/blocks/importer/wordpress/upgrade-plan';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import type { Step } from '../../types';

// const SiteMigrationUpgradePlan: Step = function ( { navigation } ) {
const SiteMigrationUpgradePlan: Step = function () {
	const translate = useTranslate();

	// const handleSubmit = () => {
	// 	navigation.submit?.();
	// };

	const siteId = 229660991;
	const siteItem = useSelector( ( state ) => getSite( state, siteId ) );

	if ( ! siteItem ) {
		return;
	}

	const planName = getPlan( PLAN_BUSINESS )?.getTitle() || '';

	const stepContent = (
		<UpgradePlan
			site={ siteItem }
			ctaText={
				// translators: %(plan)s is the plan name - e.g. Business or Creator
				translate( 'Get %(plan)s', {
					args: {
						plan: planName,
					},
				} ) as string
			}
			subTitleText={
				// translators: %(plan)s is the plan name - e.g. Business or Creator
				translate( 'Importing a backup file requires a %(planName)s plan', {
					args: {
						planName,
					},
				} ) as string
			}
			isBusy={ false }
			onCtaClick={ () => {
				// console.log( 'CTA' );
				// stepNavigator?.goToCheckoutPage?.( WPImportOption.CONTENT_ONLY );
			} }
			navigateToVerifyEmailStep={ () => {
				// console.log( 'verify email' );
				// stepNavigator?.goToVerifyEmailPage?.();
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
