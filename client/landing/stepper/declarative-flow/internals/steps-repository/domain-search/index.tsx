import {
	isAIBuilderFlow,
	isCopySiteFlow,
	isDomainFlow,
	isHundredYearDomainFlow,
	isHundredYearPlanFlow,
	isNewHostedSiteCreationFlow,
	isNewsletterFlow,
	isOnboardingFlow,
	Step,
	StepContainer,
} from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { FreeDomainForAYearPromo } from 'calypso/components/domains/wpcom-domain-search/free-domain-for-a-year-promo';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
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
	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const initialQuery = useQuery().get( 'new' ) ?? '';
	const tldQuery = useQuery().get( 'tld' );

	const config = useMemo( () => {
		const allowedTlds = tldQuery?.split( ',' ) ?? [];

		return {
			vendor: getSuggestionsVendor( {
				isSignup: false,
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
				! isDomainFlow( flow ),
			allowedTlds,
			allowsUsingOwnDomain: ! isAIBuilderFlow( flow ) && ! isNewHostedSiteCreationFlow( flow ),
		};
	}, [ flow, tldQuery ] );

	const { submit } = navigation;

	const events = useMemo( () => {
		return {
			onExternalDomainClick: ( domainName?: string ) => {
				submit( {
					navigateToUseMyDomain: true,
					lastQuery: domainName,
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
				} );
			},
			onSkip: ( suggestion?: FreeDomainSuggestion ) => {
				submit( {
					siteUrl: suggestion?.domain_name.replace( '.wordpress.com', '' ),
					domainItem: undefined,
					domainCart: [],
					suggestion,
				} );
			},
		};
	}, [ submit ] );

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
			className={ shouldUseStepContainerV2( flow ) ? 'domain-search--step-container-v2' : '' }
			currentSiteId={ site?.ID }
			// eslint-disable-next-line no-nested-ternary
			currentSiteUrl={ site?.URL ? site.URL : siteSlug ? `https://${ siteSlug }` : undefined }
			flowName={ flow }
			config={ config }
			initialQuery={ initialQuery }
			isFirstDomainFreeForFirstYear={ isOnboardingFlow( flow ) || isDomainFlow( flow ) }
			events={ events }
			flowAllowsMultipleDomainsInCart={
				isOnboardingFlow( flow ) || isDomainFlow( flow ) || isNewHostedSiteCreationFlow( flow )
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
			stepName="domain-search"
			isWideLayout
			flowName={ flow }
			formattedHeader={
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />
			}
			stepContent={ domainSearchElement }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DomainSearchStep;
