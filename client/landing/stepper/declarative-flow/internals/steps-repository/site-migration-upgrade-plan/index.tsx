import { getPlan, type PlanSlug } from '@automattic/calypso-products';
import { Step } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import MigrationPlansGrid from './migration-plans-grid';
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
		verifyEmail?: boolean;
	};
} > = ( { navigation } ) => {
	const siteItem = useSite();
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const queryParams = useQuery();

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
				<MigrationPlansGrid
					siteId={ siteItem.ID }
					onUpgradeClick={ handleUpgradeClick }
					coupon={ queryParams.get( 'coupon' ) ?? undefined }
				/>
			</Step.WideLayout>
		</>
	);
};

export default SiteMigrationUpgradePlan;
