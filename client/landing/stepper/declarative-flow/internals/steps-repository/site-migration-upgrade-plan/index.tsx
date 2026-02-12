import config from '@automattic/calypso-config';
import { PLAN_MIGRATION_TRIAL_MONTHLY, getPlan, type PlanSlug } from '@automattic/calypso-products';
import { Step } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import { getIntervalType } from '../unified-plans/util';
import type { Step as StepType } from '../../types';

import './style.scss';

const SiteMigrationUpgradePlan: StepType< {
	accepts: {
		skipLabelText?: string;
		onSkip?: () => void;
		skipPosition?: 'top' | 'bottom';
		headerText?: string;
	};
	submits: {
		goToCheckout?: boolean;
		plan?: string;
		sendIntentWhenCreatingTrial?: boolean;
		verifyEmail?: boolean;
	};
} > = ( { navigation } ) => {
	const siteItem = useSite();
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const queryParams = useQuery();

	const [ intervalType, setIntervalType ] = useState< 'yearly' | '2yearly' >( 'yearly' );

	const handlePlanIntervalUpdate = useCallback( ( path: string ) => {
		const interval = getIntervalType( path );
		setIntervalType( interval as 'yearly' | '2yearly' );
	}, [] );

	const handleUpgradeClick = useCallback(
		( cartItems?: MinimalRequestCartProduct[] | null ) => {
			const planCartItem = cartItems?.[ 0 ];

			if ( planCartItem ) {
				const plan = getPlan( planCartItem.product_slug as PlanSlug );
				navigation?.submit?.( {
					goToCheckout: true,
					plan: plan?.getPathSlug ? plan.getPathSlug() : '',
				} );
			}
		},
		[ navigation ]
	);

	const handleFreeTrialClick = useCallback( () => {
		navigation.submit?.( {
			goToCheckout: true,
			plan: PLAN_MIGRATION_TRIAL_MONTHLY,
			sendIntentWhenCreatingTrial: true,
		} );
	}, [ navigation ] );

	if ( ! siteItem || ! siteSlug ) {
		return <Step.Loading />;
	}

	const headerText = translate( 'Pick a plan to start your migration' );
	const subHeaderText = translate(
		'Migrations are available on all paid plans. Choose the plan that best fits your needs.'
	);

	return (
		<>
			<DocumentHead title={ headerText } />
			<Step.WideLayout
				topBar={
					<Step.TopBar
						leftElement={
							navigation?.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
					/>
				}
				heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
				className="site-migration-upgrade-plan"
			>
				<PlansFeaturesMain
					siteId={ siteItem.ID }
					intent="plans-migration"
					isInSignup
					intervalType={ intervalType }
					displayedIntervals={ [ 'yearly', '2yearly' ] }
					showPlanTypeSelectorDropdown={ config.isEnabled( 'onboarding/interval-dropdown' ) }
					onPlanIntervalUpdate={ handlePlanIntervalUpdate }
					onUpgradeClick={ handleUpgradeClick }
					flowName="site-migration"
					hidePlansFeatureComparison
					coupon={ queryParams.get( 'coupon' ) ?? undefined }
				/>
				<div className="site-migration-upgrade-plan__trial-section">
					<button
						className="site-migration-upgrade-plan__trial-button"
						onClick={ handleFreeTrialClick }
					>
						{ translate( 'Or try a free 7-day trial' ) }
					</button>
					<p className="site-migration-upgrade-plan__trial-description">
						{ translate(
							'Not sure which plan is right for you? Start a 7-day trial to test the migration process.'
						) }
					</p>
				</div>
			</Step.WideLayout>
		</>
	);
};

export default SiteMigrationUpgradePlan;
