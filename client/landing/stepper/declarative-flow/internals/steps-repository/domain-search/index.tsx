import {
	isAIBuilderFlow,
	isCopySiteFlow,
	isDomainFlow,
	isDomainAndPlanFlow,
	isHundredYearDomainFlow,
	isHundredYearPlanFlow,
	isNewHostedSiteCreationFlow,
	isNewsletterFlow,
	isOnboardingFlow,
	Step,
	StepContainer,
} from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { FreeDomainForAYearPromo } from 'calypso/components/domains/wpcom-domain-search/free-domain-for-a-year-promo';
import { useQueryHandler } from 'calypso/components/domains/wpcom-domain-search/use-query-handler';
import FormattedHeader from 'calypso/components/formatted-header';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { domainManagementTransferToOtherSite } from 'calypso/my-sites/domains/paths';
import { useQuery } from '../../../../hooks/use-query';
import { useSite } from '../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';
import type { FreeDomainSuggestion } from '@automattic/api-core';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

import './style.scss';

type UseMyDomain = {
	navigateToUseMyDomain: true;
	siteUrl?: string;
	domainItem?: MinimalRequestCartProduct;
	lastQuery?: string;
};

type StepSubmission = {
	navigateToUseMyDomain?: never;
	siteUrl?: string;
	suggestion?: {
		domain_name: string;
		is_free: boolean;
	};
	domainItem?: MinimalRequestCartProduct;
	domainCart?: MinimalRequestCartProduct[];
	signupDomainOrigin?: string;
};

const DomainSearchStep: StepType< {
	submits: UseMyDomain | StepSubmission;
} > = function DomainSearchStep( { navigation, flow } ) {
	const translate = useTranslate();

	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const initialQuery = useQuery().get( 'new' ) ?? '';
	const tldQuery = useQuery().get( 'tld' );

	// eslint-disable-next-line no-nested-ternary
	const currentSiteUrl = site?.URL ? site.URL : siteSlug ? `https://${ siteSlug }` : undefined;

	const { query, setQuery } = useQueryHandler( {
		initialQuery,
		currentSiteUrl,
	} );

	const config = useMemo( () => {
		const allowedTlds = tldQuery?.split( ',' ) ?? [];

		return {
			vendor: getSuggestionsVendor( {
				isSignup:
					! isDomainAndPlanFlow( flow ) && ! isCopySiteFlow( flow ) && ! isDomainFlow( flow ),
				isDomainOnly: isDomainFlow( flow ),
				flowName: flow,
			} ),
			priceRules: {
				hidePrice: isHundredYearPlanFlow( flow ),
				oneTimePrice: isHundredYearDomainFlow( flow ),
			},
			includeDotBlogSubdomain: isNewsletterFlow( flow ),
			skippable:
				! isHundredYearPlanFlow( flow ) &&
				! isHundredYearDomainFlow( flow ) &&
				! isDomainFlow( flow ) &&
				! isDomainAndPlanFlow( flow ),
			allowedTlds,
			allowsUsingOwnDomain: ! isAIBuilderFlow( flow ) && ! isNewHostedSiteCreationFlow( flow ),
		};
	}, [ flow, tldQuery ] );

	const { submit } = navigation;

	const events = useMemo( () => {
		return {
			onQueryChange: setQuery,
			onMoveDomainToSiteClick( otherSiteDomain: string, domainName: string ) {
				window.location.assign(
					domainManagementTransferToOtherSite( otherSiteDomain, domainName )
				);
			},
			onExternalDomainClick: ( domainName?: string ) => {
				submit( {
					navigateToUseMyDomain: true,
					lastQuery: domainName,
					shouldSkipSubmitTracking: true,
				} );
			},
			onContinue: ( domainCart: MinimalRequestCartProduct[] ) => {
				const domainItem = domainCart[ 0 ];

				submit( {
					siteUrl: domainItem.meta,
					domainItem,
					domainCart,
					suggestion: {
						domain_name: domainItem.meta!,
						is_free: false,
					},
					signupDomainOrigin: SIGNUP_DOMAIN_ORIGIN.CUSTOM,
				} );
			},
			onSkip: ( suggestion?: FreeDomainSuggestion ) => {
				submit( {
					siteUrl: suggestion?.domain_name.replace( '.wordpress.com', '' ),
					domainItem: undefined,
					domainCart: [],
					suggestion,
					signupDomainOrigin: suggestion
						? SIGNUP_DOMAIN_ORIGIN.FREE
						: SIGNUP_DOMAIN_ORIGIN.CHOOSE_LATER,
				} );
			},
		};
	}, [ submit, setQuery ] );

	const slots = useMemo( () => {
		return {
			BeforeResults: () => <FreeDomainForAYearPromo />,
			BeforeFullCartItems: () => <FreeDomainForAYearPromo textOnly />,
		};
	}, [] );

	const headerText = useMemo( () => {
		if ( isNewsletterFlow( flow ) ) {
			return __( 'Your domain. Your identity.' );
		}

		if ( isHundredYearPlanFlow( flow ) || isHundredYearDomainFlow( flow ) ) {
			return __( 'Find the perfect domain' );
		}

		return __( 'Claim your space on the web' );
	}, [ flow ] );

	const subHeaderText = useMemo( () => {
		if ( isNewsletterFlow( flow ) ) {
			return __( 'Make your newsletter stand out with a custom domain.' );
		}

		if ( isCopySiteFlow( flow ) ) {
			return __( 'Make your copied site unique with a custom domain all of its own.' );
		}
		if ( isHundredYearPlanFlow( flow ) || isHundredYearDomainFlow( flow ) ) {
			return __( 'Secure your 100-Year domain and start building your legacy.' );
		}

		return __( 'Make it yours with a .com, .blog, or one of 350+ domain options.' );
	}, [ flow ] );

	const domainSearchElement = (
		<WPCOMDomainSearch
			className={
				shouldUseStepContainerV2( flow )
					? 'domain-search--step-container-v2'
					: 'domain-search--step-container'
			}
			currentSiteId={ site?.ID }
			currentSiteUrl={ currentSiteUrl }
			flowName={ flow }
			config={ config }
			query={ query }
			isFirstDomainFreeForFirstYear={
				isOnboardingFlow( flow ) || isDomainFlow( flow ) || isDomainAndPlanFlow( flow )
			}
			events={ events }
			flowAllowsMultipleDomainsInCart={
				isOnboardingFlow( flow ) ||
				isDomainFlow( flow ) ||
				isNewHostedSiteCreationFlow( flow ) ||
				isDomainAndPlanFlow( flow )
			}
			slots={ slots }
		/>
	);

	if ( shouldUseStepContainerV2( flow ) ) {
		return (
			<Step.CenteredColumnLayout
				topBar={
					<Step.TopBar
						leftElement={
							navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : undefined
						}
						rightElement={
							query && config.allowsUsingOwnDomain ? (
								<Step.LinkButton onClick={ () => events.onExternalDomainClick( query ) }>
									{ translate( 'Use a domain I already own' ) }
								</Step.LinkButton>
							) : undefined
						}
					/>
				}
				columnWidth={ 10 }
				className="step-container-v2--domain-search"
				heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
			>
				{ domainSearchElement }
			</Step.CenteredColumnLayout>
		);
	}

	return (
		<StepContainer
			stepName="step-container--domain-search"
			isWideLayout
			flowName={ flow }
			goBack={ navigation.goBack }
			formattedHeader={
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />
			}
			stepContent={ domainSearchElement }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DomainSearchStep;
