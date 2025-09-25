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
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { isMonthlyOrFreeFlow } from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { domainManagementTransferToOtherSite } from 'calypso/my-sites/domains/paths';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { USE_MY_DOMAIN_SECTION_NAME, UseMyDomain } from './use-my-domain';
import type { StepProps } from './types';

import './style.scss';

const getThemeSlugWithRepo = ( themeSlug: string | undefined, isPurchasingTheme: boolean ) => {
	if ( ! themeSlug ) {
		return undefined;
	}

	const repo = isPurchasingTheme ? 'premium' : 'pub';

	return `${ repo }/${ themeSlug }`;
};

const DomainSearchUI = (
	props: StepProps & {
		locale: string;
		baseSubmitStepProps: Record< string, unknown >;
		baseSubmitProvidedDependencies: Record< string, unknown >;
	}
) => {
	const {
		flowName,
		stepName,
		submitSignupStep,
		goToNextStep,
		locale,
		queryObject,
		baseSubmitStepProps,
		baseSubmitProvidedDependencies,
	} = props;

	const isDomainOnlyFlow = flowName === 'domain';
	const isOnboardingWithEmailFlow = flowName === 'onboarding-with-email';

	const events = useMemo( () => {
		return {
			onAddDomainToCart: ( product: MinimalRequestCartProduct ) => {
				if ( isDomainForGravatarFlow( flowName ) ) {
					return {
						...product,
						extra: {
							...product.extra,
							is_gravatar_domain: true,
						},
					};
				}

				return product;
			},
			onMoveDomainToSiteClick( otherSiteDomain: string, domainName: string ) {
				page( domainManagementTransferToOtherSite( otherSiteDomain, domainName ) );
			},
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
						...baseSubmitStepProps,
						stepSectionName: '',
						domainItem,
						isPurchasingItem: true,
						siteUrl: domainItem.meta,
						domainCart,
					},
					{
						...baseSubmitProvidedDependencies,
						signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.CUSTOM,
						domainItem,
						siteUrl: domainItem.meta,
						domainCart,
					}
				);

				if ( isDomainForGravatarFlow( flowName ) ) {
					submitSignupStep(
						{
							stepName: 'site-or-domain',
							domainItem,
							designType: 'domain',
							siteSlug: domainItem.meta,
							siteUrl: domainItem.meta,
							isPurchasingItem: true,
						},
						{ designType: 'domain', domainItem, siteUrl: domainItem.meta }
					);
					submitSignupStep(
						{ stepName: 'site-picker', wasSkipped: true },
						{ themeSlugWithRepo: 'pub/twentysixteen' }
					);
				}

				goToNextStep();
			},
			onSkip( suggestion?: FreeDomainSuggestion ) {
				const siteUrl = suggestion?.domain_name.replace( '.wordpress.com', '' );

				submitSignupStep(
					{
						...baseSubmitStepProps,
						stepSectionName: '',
						domainItem: undefined,
						isPurchasingItem: false,
						domainCart: [],
						siteUrl,
					},
					{
						...baseSubmitProvidedDependencies,
						signupDomainOrigin: suggestion
							? SIGNUP_DOMAIN_ORIGIN.FREE
							: SIGNUP_DOMAIN_ORIGIN.CHOOSE_LATER,
						domainCart: [],
						siteUrl,
					}
				);

				goToNextStep();
			},
		};
	}, [
		flowName,
		stepName,
		submitSignupStep,
		goToNextStep,
		locale,
		isDomainOnlyFlow,
		baseSubmitStepProps,
		baseSubmitProvidedDependencies,
	] );

	const allowedTldParam = queryObject.tld;

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
			includeOwnedDomainInSuggestions: ! isDomainOnlyFlow,
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
		queryObject,
	} = props;

	const isLoggedIn = useSelector( isUserLoggedIn );
	const locale = ! isLoggedIn ? externalLocale : '';
	const themeSlug = queryObject.theme;

	const baseSubmitStepProps = useMemo( () => {
		const themeStyleVariation = queryObject.style_variation;

		const isPurchasingTheme = !! queryObject.premium;
		const themeSlugWithRepo = getThemeSlugWithRepo( themeSlug, isPurchasingTheme );

		return {
			stepName,
			themeSlug,
			themeSlugWithRepo,
			themeStyleVariation,
		};
	}, [ stepName, themeSlug, queryObject ] );

	const baseSubmitProvidedDependencies = useMemo( () => {
		if ( themeSlug ) {
			return {
				useThemeHeadstartItem: true,
			};
		}

		return {};
	}, [ themeSlug ] );

	if ( stepSectionName === USE_MY_DOMAIN_SECTION_NAME ) {
		const handleUseMyDomainSubmit = ( domainItem: MinimalRequestCartProduct ) => {
			submitSignupStep(
				{
					...baseSubmitStepProps,
					stepSectionName,
					domainItem,
					isPurchasingItem: true,
					siteUrl: domainItem.meta,
					domainCart: [],
				},
				{
					...baseSubmitProvidedDependencies,
					signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN,
					domainItem,
					siteUrl: domainItem.meta,
					domainCart: [],
				}
			);

			goToNextStep();
		};

		const handleSkip = () => {
			submitSignupStep(
				{
					...baseSubmitStepProps,
					stepSectionName,
					suggestion: undefined,
					isPurchasingItem: false,
					domainCart: [],
					siteUrl: '',
				},
				{
					...baseSubmitProvidedDependencies,
					signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.CHOOSE_LATER,
					suggestion: undefined,
					domainCart: [],
					siteUrl: '',
				}
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

	return (
		<DomainSearchUI
			{ ...props }
			locale={ locale }
			baseSubmitStepProps={ baseSubmitStepProps }
			baseSubmitProvidedDependencies={ baseSubmitProvidedDependencies }
		/>
	);
}

export default localize( DomainSearchStep );
