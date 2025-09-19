import { FreeDomainSuggestion, useMyDomainInputMode } from '@automattic/api-core';
import page from '@automattic/calypso-router';
import { isDomainForGravatarFlow, isEcommerceFlow, isFreeFlow } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { localize } from 'i18n-calypso';
import { useMemo } from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { FreeDomainForAYearPromo } from 'calypso/components/domains/wpcom-domain-search/free-domain-for-a-year-promo';
import { isMonthlyOrFreeFlow } from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getStepUrl } from '../../utils';
import { USE_MY_DOMAIN_SECTION_NAME, UseMyDomain } from './use-my-domain';
import type { StepProps } from './types';

import './style.scss';

const DomainSearchUI = ( props: StepProps & { locale: string } ) => {
	const { flowName, stepName, submitSignupStep, goToNextStep, locale, queryObject } = props;

	const isDomainOnlyFlow = flowName === 'domain';
	const isOnboardingWithEmailFlow = flowName === 'onboarding-with-email';

	const allowedTldParam = queryObject.tld;

	const events = useMemo( () => {
		return {
			onExternalDomainClick( initialQuery?: string ) {
				if ( isDomainOnlyFlow ) {
					return page(
						addQueryArgs( '/setup/domain-transfer/intro', {
							new: initialQuery,
							search: 'yes',
						} )
					);
				}

				page(
					getStepUrl( flowName, stepName, USE_MY_DOMAIN_SECTION_NAME, locale, {
						step: useMyDomainInputMode.domainInput,
						initialQuery: initialQuery,
					} )
				);
			},
			onContinue( domainCart: MinimalRequestCartProduct[] ) {
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
			onSkip( suggestion?: FreeDomainSuggestion ) {
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
		};
	}, [ flowName, stepName, submitSignupStep, goToNextStep, locale, isDomainOnlyFlow ] );

	const config = useMemo( () => {
		const allowedTlds = Array.isArray( allowedTldParam )
			? allowedTldParam
			: allowedTldParam?.split( ',' ) ?? [];

		return {
			vendor: getSuggestionsVendor( {
				isSignup: true,
				isDomainOnly: isDomainOnlyFlow,
				flowName: flowName,
			} ),
			priceRules: {
				forceRegularPrice: isMonthlyOrFreeFlow( flowName ),
			},
			allowedTlds,
			deemphasizedTlds: isEcommerceFlow( flowName ) ? [ 'blog' ] : [],
			skippable: ! isDomainOnlyFlow && ! isDomainForGravatarFlow( flowName ),
			allowsUsingOwnDomain:
				! isDomainForGravatarFlow( flowName ) &&
				! isOnboardingWithEmailFlow &&
				! isFreeFlow( flowName ),
		};
	}, [ flowName, isDomainOnlyFlow, isOnboardingWithEmailFlow, allowedTldParam ] );

	const slots = useMemo( () => {
		return {
			BeforeResults: () => {
				if ( isDomainForGravatarFlow( flowName ) || isFreeFlow( flowName ) ) {
					return null;
				}

				return <FreeDomainForAYearPromo />;
			},
			BeforeFullCartItems: () => {
				if ( isDomainForGravatarFlow( flowName ) || isFreeFlow( flowName ) ) {
					return null;
				}

				return <FreeDomainForAYearPromo textOnly />;
			},
		};
	}, [ flowName ] );

	const flowAllowsMultipleDomainsInCart = isDomainOnlyFlow;

	const headerText = useMemo( () => {
		if ( isDomainForGravatarFlow( flowName ) ) {
			return __( 'Choose a domain' );
		}

		return __( 'Claim your space on the web' );
	}, [ flowName ] );

	const subHeaderText = useMemo( () => {
		if ( isDomainForGravatarFlow( flowName ) ) {
			return __( 'Enter some descriptive keywords to get started.' );
		}

		return __( 'Make it yours with a .com, .blog, or one of 350+ domain options.' );
	}, [ flowName ] );

	return (
		<StepWrapper
			{ ...props }
			className="step-wrapper--domain-search"
			hideSkip
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			stepContent={
				<WPCOMDomainSearch
					className="domain-search--step-wrapper"
					flowName={ flowName }
					initialQuery={ queryObject.new }
					events={ events }
					config={ config }
					flowAllowsMultipleDomainsInCart={ flowAllowsMultipleDomainsInCart }
					slots={ slots }
				/>
			}
		/>
	);
};

function DomainSearchStep( props: StepProps & { locale: string } ) {
	const {
		stepName,
		locale: externalLocale,
		submitSignupStep,
		goToNextStep,
		stepSectionName,
	} = props;

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

	return <DomainSearchUI { ...props } locale={ locale } />;
}

export default localize( DomainSearchStep );
