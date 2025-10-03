import { FreeDomainSuggestion, useMyDomainInputMode } from '@automattic/api-core';
import page from '@automattic/calypso-router';
import {
	isDomainForGravatarFlow,
	isEcommerceFlow,
	isFreeFlow,
	isWithThemeFlow,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { localize, useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { FreeDomainForAYearPromo } from 'calypso/components/domains/wpcom-domain-search/free-domain-for-a-year-promo';
import { useQueryHandler } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import { isRelativeUrl } from 'calypso/dashboard/utils/url';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { isMonthlyOrFreeFlow } from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { domainManagementTransferToOtherSite } from 'calypso/my-sites/domains/paths';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
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
		previousStepName,
		goBack,
	} = props;

	const isDomainOnlyFlow = flowName === 'domain';
	const isOnboardingWithEmailFlow = flowName === 'onboarding-with-email';

	const siteSlug = queryObject.siteSlug;
	const currentSiteUrl = siteSlug ? `https://${ siteSlug }` : undefined;

	const { query, setQuery } = useQueryHandler( {
		initialQuery: queryObject.new,
		currentSiteUrl,
	} );

	const events = useMemo( () => {
		return {
			onQueryChange: setQuery,
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
						siteSlug,
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
				submitSignupStep(
					{
						...baseSubmitStepProps,
						stepSectionName: '',
						domainItem: undefined,
						isPurchasingItem: false,
						domainCart: [],
						siteUrl: suggestion?.domain_name.replace( '.wordpress.com', '' ),
					},
					{
						...baseSubmitProvidedDependencies,
						signupDomainOrigin: suggestion
							? SIGNUP_DOMAIN_ORIGIN.FREE
							: SIGNUP_DOMAIN_ORIGIN.CHOOSE_LATER,
						domainCart: [],
						siteUrl: suggestion?.domain_name,
					}
				);

				goToNextStep();
			},
		};
	}, [
		flowName,
		stepName,
		siteSlug,
		setQuery,
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
			skippable:
				! isDomainOnlyFlow && ! isDomainForGravatarFlow( flowName ) && ! isOnboardingWithEmailFlow,
			includeOwnedDomainInSuggestions: ! isDomainOnlyFlow,
			allowsUsingOwnDomain: ! isDomainForGravatarFlow( flowName ) && ! isOnboardingWithEmailFlow,
		};
	}, [ flowName, isDomainOnlyFlow, isOnboardingWithEmailFlow, allowedTldParam ] );

	const slots = useMemo( () => {
		return {
			BeforeResults: () => {
				if (
					isDomainOnlyFlow ||
					isDomainForGravatarFlow( flowName ) ||
					isFreeFlow( flowName ) ||
					isOnboardingWithEmailFlow
				) {
					return null;
				}

				return <FreeDomainForAYearPromo />;
			},
			BeforeFullCartItems: () => {
				if (
					isDomainOnlyFlow ||
					isDomainForGravatarFlow( flowName ) ||
					isFreeFlow( flowName ) ||
					isOnboardingWithEmailFlow
				) {
					return null;
				}

				return <FreeDomainForAYearPromo textOnly />;
			},
		};
	}, [ flowName, isOnboardingWithEmailFlow, isDomainOnlyFlow ] );

	const flowAllowsMultipleDomainsInCart = isDomainOnlyFlow;

	const headerText = useMemo( () => {
		if ( isOnboardingWithEmailFlow ) {
			return __( 'Choose a domain for your Professional Email' );
		}

		if ( isDomainForGravatarFlow( flowName ) ) {
			return __( 'Choose a domain' );
		}

		return __( 'Claim your space on the web' );
	}, [ flowName, isOnboardingWithEmailFlow ] );

	const subHeaderText = useMemo( () => {
		if ( isDomainForGravatarFlow( flowName ) ) {
			return __( 'Enter some descriptive keywords to get started.' );
		}

		return __( 'Make it yours with a .com, .blog, or one of 350+ domain options.' );
	}, [ flowName ] );

	const translate = useTranslate();
	const userSiteCount = useSelector( getCurrentUserSiteCount );

	const { hideBack, backUrl, backLabelText } = useMemo( () => {
		let backUrl;
		let backLabelText;

		const shouldHideBack = ! userSiteCount && previousStepName?.startsWith( 'user' ) && ! goBack;

		const hideBack = flowName === 'domain' || shouldHideBack;

		const [ sitesBackLabelText, defaultBackUrl ] =
			userSiteCount && userSiteCount === 1
				? [ translate( 'Back to My Home' ), '/home' ]
				: [ translate( 'Back to sites' ), '/sites' ];

		if ( isDomainForGravatarFlow( flowName ) ) {
			backUrl = null;
			backLabelText = null;
		} else if ( 'with-plugin' === flowName ) {
			backUrl = '/plugins';
			backLabelText = translate( 'Back to plugins' );
		} else if ( isWithThemeFlow( flowName ) ) {
			backUrl = '/themes';
			backLabelText = translate( 'Back to themes' );
		} else if ( 'plans-first' === flowName ) {
			backUrl = getStepUrl( flowName, previousStepName );
		} else {
			backUrl = defaultBackUrl;
			backLabelText = sitesBackLabelText;

			const backTo = getQueryArg( window.location.href, 'back_to' )?.toString();
			if ( backTo && isRelativeUrl( backTo ) ) {
				backUrl = backTo;
				backLabelText = translate( 'Back' );
			}
		}

		return {
			hideBack,
			backUrl,
			backLabelText,
		};
	}, [ flowName, previousStepName, goBack, userSiteCount, translate ] );

	const getUseDomainIOwnLink = () => {
		if ( ! query || ! config.allowsUsingOwnDomain ) {
			return null;
		}

		return (
			<Button
				className="step-wrapper__navigation-link forward"
				onClick={ () => events.onExternalDomainClick( query ) }
				variant="link"
			>
				<span>{ __( 'Use a domain I already own' ) }</span>
			</Button>
		);
	};

	return (
		<StepWrapper
			{ ...props }
			className="step-wrapper--domain-search"
			hideSkip
			customizedActionButtons={ getUseDomainIOwnLink() }
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			hideBack={ hideBack }
			backUrl={ backUrl }
			backLabelText={ backLabelText }
			isWideLayout
			stepContent={
				<WPCOMDomainSearch
					className="domain-search--step-wrapper"
					flowName={ flowName }
					query={ query }
					currentSiteUrl={ currentSiteUrl }
					events={ events }
					config={ config }
					flowAllowsMultipleDomainsInCart={ flowAllowsMultipleDomainsInCart }
					slots={ slots }
					isFirstDomainFreeForFirstYear={ ! isFreeFlow( flowName ) }
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
				useThemeHeadstart: true,
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
