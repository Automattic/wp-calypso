import { useShoppingCart, ShoppingCartProvider } from '@automattic/shopping-cart';
import { useLayoutEffect, useRef } from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { shoppingCartManagerClient } from 'calypso/dashboard/app/shopping-cart';
import {
	domainRegistration,
	getDomainsInCart,
	isMonthlyOrFreeFlow,
} from 'calypso/lib/cart-values/cart-items';
import { getDomainProductSlug } from 'calypso/lib/domains/get-domain-product-slug';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import StepWrapper from 'calypso/signup/step-wrapper';

export type StepProps = {
	stepSectionName: string | null;
	siteId?: number;
	stepName: string;
	flowName: string;
	goToStep: () => void;
	goToNextStep: () => void;
	submitSignupStep: ( step: unknown, dependencies: unknown ) => void;
	queryObject: Record< string, string | undefined >;
};

function DomainSearchStep( {
	flowName,
	queryObject,
	submitSignupStep,
	goToNextStep,
	stepName,
	stepSectionName,
	siteId,
	...otherProps
}: StepProps ) {
	const isDomainOnly = flowName === 'domain';
	const shouldSearch = queryObject.search === 'yes';
	const initialQuery = queryObject.new;
	const cart = useShoppingCart( siteId ?? 'no-site' );
	const domainCart = getDomainsInCart( cart.responseCart );

	const isFirstRender = useRef( true );

	const shouldSubmitWithoutSearching = isDomainOnly && ! shouldSearch && initialQuery;

	useLayoutEffect( () => {
		if ( shouldSubmitWithoutSearching && isFirstRender.current ) {
			isFirstRender.current = false;

			const productSlug = getDomainProductSlug( initialQuery );
			const domainItem = domainRegistration( {
				productSlug,
				domain: initialQuery,
				extra: { flow_name: flowName },
			} );

			submitSignupStep(
				{
					stepName,
					domainItem,
					siteUrl: initialQuery,
					isPurchasingItem: true,
					stepSectionName,
					domainCart,
				},
				{
					domainItem,
					siteUrl: initialQuery,
					domainCart,
				}
			);

			goToNextStep();
		}
	}, [
		shouldSubmitWithoutSearching,
		shouldSearch,
		initialQuery,
		domainCart,
		flowName,
		stepName,
		stepSectionName,
		siteId,
		submitSignupStep,
		goToNextStep,
	] );

	const getContent = () => {
		return (
			<WPCOMDomainSearch
				initialQuery={ initialQuery }
				flowName={ flowName }
				config={ {
					vendor: getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: flowName === 'domain',
						flowName,
					} ),
					priceRules: {
						forceRegularPrice: isMonthlyOrFreeFlow( flowName ),
					},
				} }
			/>
		);
	};

	if ( shouldSubmitWithoutSearching ) {
		return null;
	}

	return (
		<StepWrapper
			headerText="Domain Search"
			subHeaderText="Domain Search"
			stepContent={ getContent() }
			{ ...otherProps }
		/>
	);
}

export default function DomainSearchStepWithCart( props: StepProps ) {
	return (
		<ShoppingCartProvider managerClient={ shoppingCartManagerClient }>
			<DomainSearchStep { ...props } />
		</ShoppingCartProvider>
	);
}
