import { useMyDomainInputMode } from '@automattic/api-core';
import page from '@automattic/calypso-router';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { localize } from 'i18n-calypso';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { isMonthlyOrFreeFlow } from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getStepUrl } from '../../utils';
import { USE_MY_DOMAIN_SECTION_NAME, UseMyDomain } from './use-my-domain';
import type { StepProps } from './types';

import './style.scss';

function DomainSearchStep( props: StepProps & { locale: string } ) {
	const {
		flowName,
		stepName,
		locale: externalLocale,
		submitSignupStep,
		goToNextStep,
		stepSectionName,
		queryObject,
	} = props;

	const isDomainOnlyFlow = flowName === 'domain';
	const isLoggedIn = useSelector( isUserLoggedIn );
	const locale = ! isLoggedIn ? externalLocale : '';

	if ( stepSectionName === USE_MY_DOMAIN_SECTION_NAME ) {
		const handleUseMyDomainSubmit = ( domainItem: MinimalRequestCartProduct ) => {
			submitSignupStep(
				{
					stepName: stepName,
					domainItem,
					isPurchasingItem: true,
					siteUrl: domainItem.meta,
					stepSectionName: stepSectionName,
					domainCart: [],
				},
				{ domainItem, siteUrl: domainItem.meta, domainCart: [] }
			);

			goToNextStep();
		};

		const handleSkip = () => {
			submitSignupStep(
				{ stepName, suggestion: undefined, isPurchasingItem: false, domainCart: [], siteUrl: '' },
				{ suggestion: undefined, domainCart: [], siteUrl: '' }
			);

			goToNextStep();
		};

		return (
			<UseMyDomain
				{ ...props }
				locale={ ! isLoggedIn ? locale : '' }
				onSubmit={ handleUseMyDomainSubmit }
				onSkip={ handleSkip }
			/>
		);
	}

	const allowedTlds = queryObject.tld?.split( ',' ) ?? [];

	return (
		<StepWrapper
			{ ...props }
			className="step-wrapper--domain-search"
			hideSkip
			headerText="Domain Search"
			subHeaderText="Domain Search"
			stepContent={
				<WPCOMDomainSearch
					className="domain-search--step-wrapper"
					flowName={ flowName }
					events={ {
						onExternalDomainClick( initialQuery ) {
							page(
								getStepUrl( flowName, stepName, USE_MY_DOMAIN_SECTION_NAME, locale, {
									step: useMyDomainInputMode.domainInput,
									initialQuery: initialQuery,
								} )
							);
						},
						onContinue( domainCart ) {
							const domainItem = domainCart[ 0 ];

							submitSignupStep(
								{
									stepName,
									domainItem,
									isPurchasingItem: true,
									siteUrl: domainItem.meta,
									stepSectionName: '',
									domainCart,
								},
								{ domainItem, siteUrl: domainItem.meta, domainCart }
							);

							goToNextStep();
						},
						onSkip( suggestion ) {
							const siteUrl = suggestion?.domain_name.replace( '.wordpress.com', '' );

							submitSignupStep(
								{
									stepName,
									domainItem: undefined,
									isPurchasingItem: false,
									domainCart: [],
									siteUrl,
								},
								{ domainCart: [], siteUrl }
							);

							goToNextStep();
						},
					} }
					config={ {
						vendor: getSuggestionsVendor( {
							isSignup: true,
							isDomainOnly: isDomainOnlyFlow,
							flowName: flowName,
						} ),
						priceRules: {
							forceRegularPrice: isMonthlyOrFreeFlow( flowName ),
						},
						allowedTlds,
						skippable: isDomainOnlyFlow,
					} }
				/>
			}
		/>
	);
}

export default localize( DomainSearchStep );
