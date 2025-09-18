import {
	isDomainFlow,
	isHundredYearDomainFlow,
	isHundredYearPlanFlow,
	isNewsletterFlow,
	isOnboardingFlow,
	Step,
	StepContainer,
} from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { useQuery } from '../../../../hooks/use-query';
import { useSite } from '../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType } from '../../types';
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
	const getSharedWrapperProps = () => {
		return {
			className: shouldUseStepContainerV2( flow ) ? 'step-container-v2--domain-search' : '',
			headerText: __( 'Claim your space on the web' ),
			headerSubText: __( 'Make it yours with a .com, .blog, or one of 350+ domain options.' ),
		};
	};

	const { className, headerText, headerSubText } = getSharedWrapperProps();

	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const initialQuery = useQuery().get( 'new' ) ?? '';
	const currentSiteUrl = site?.URL ? new URL( site.URL ).host : siteSlug ?? undefined;
	const allowedTlds = useQuery().get( 'tld' )?.split( ',' ) ?? [];

	const config = {
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
		skippable: isNewsletterFlow( flow ) || isOnboardingFlow( flow ),
		allowedTlds,
	};

	const domainSearchElement = (
		<WPCOMDomainSearch
			className={ className }
			currentSiteId={ site?.ID }
			currentSiteUrl={ currentSiteUrl }
			flowName={ flow }
			config={ config }
			initialQuery={ initialQuery }
			isFirstDomainFreeForFirstYear={ isOnboardingFlow( flow ) || isDomainFlow( flow ) }
			events={ {
				onExternalDomainClick: ( domainName ) => {
					navigation.submit( {
						navigateToUseMyDomain: true,
						lastQuery: domainName,
					} );
				},
				onContinue: ( domainCart ) => {
					const domainItem = domainCart[ 0 ];

					navigation.submit( {
						siteUrl: domainItem.meta,
						domainItem,
						domainCart,
						suggestion: {
							domain_name: domainItem.meta,
							is_free: false,
						},
					} );
				},
				onSkip: ( suggestion ) => {
					navigation.submit( {
						siteUrl: suggestion?.domain_name.replace( '.wordpress.com', '' ),
						domainItem: undefined,
						domainCart: [],
						suggestion,
					} );
				},
			} }
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
				heading={ <Step.Heading text={ headerText } subText={ headerSubText } /> }
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
			goBack={ () => {} }
			goNext={ () => {} }
			formattedHeader={
				<FormattedHeader headerText={ headerText } subHeaderText={ headerSubText } />
			}
			stepContent={ domainSearchElement }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DomainSearchStep;
