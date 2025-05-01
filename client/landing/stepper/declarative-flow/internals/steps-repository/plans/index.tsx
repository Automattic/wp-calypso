import { isDomainUpsellFlow, isStartWritingFlow, StepContainer } from '@automattic/onboarding';
import { useMarketplaceThemeProducts } from 'calypso/landing/stepper/hooks/use-marketplace-theme-products';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import { useQuery } from '../../../../hooks/use-query';
import PlansWrapper from './plans-wrapper';
import type { Step } from '../../types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
/**
 * @deprecated Use `unified-plans` instead. This step is deprecated and will be removed in the future.
 */
const plans: Step< {
	submits: {
		plan: MinimalRequestCartProduct | null;
		goToCheckout: boolean;
		// Fake type just to make the this step types isomorphic to unified-plans.
		cartItems?: undefined;
		selectedMarketplaceProduct?: ProductListItem;
	};
} > = function Plans( { navigation, flow } ) {
	const { goBack, submit } = navigation;

	const { selectedMarketplaceProduct } = useMarketplaceThemeProducts();

	const query = useQuery();
	const queryParams = Object.fromEntries( query );
	const plan = queryParams.plan;

	const handleSubmit = ( plan: MinimalRequestCartProduct | null ) => {
		const providedDependencies = {
			plan,
			goToCheckout: isDomainUpsellFlow( flow ) || isStartWritingFlow( flow ),
			selectedMarketplaceProduct,
		};

		submit?.( providedDependencies );
	};

	// If we have a plan from URL params, submit it immediately and don't render anything
	if ( plan ) {
		handleSubmit( { product_slug: plan } );
		return null;
	}

	const isAllowedToGoBack = isDomainUpsellFlow( flow );

	return (
		<StepContainer
			stepName="plans"
			goBack={ goBack }
			isHorizontalLayout={ false }
			isWideLayout={ false }
			isExtraWideLayout
			hideFormattedHeader
			isLargeSkipLayout={ false }
			hideBack={ ! isAllowedToGoBack }
			stepContent={ <PlansWrapper flowName={ flow } onSubmit={ handleSubmit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default plans;
