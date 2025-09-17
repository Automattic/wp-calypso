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
	domainItem: MinimalRequestCartProduct;
	domainCart: MinimalRequestCartProduct[];
	signupDomainOrigin?: string;
};

const DomainSearchStep: StepType< {
	submits: UseMyDomain | StepSubmission;
} > = function DomainSearchStep( { navigation, flow } ) {
	const site = useSite();
	const initialQuery = useQuery().get( 'new' ) ?? site?.slug;
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
		skippable: isNewsletterFlow( flow ),
		allowedTlds,
	};

	const text = __( 'Claim your space on the web' );
	const subText = __( 'Make it yours with a .com, .blog, or one of 350+ domain options.' );

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
				heading={ <Step.Heading text={ text } subText={ subText } /> }
			>
				<WPCOMDomainSearch
					className="step-container-v2-domain-search"
					currentSiteId={ site?.ID }
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
						onContinue: ( items ) => {
							navigation.submit( {
								domainCart: items,
								domainItem: items[ 0 ],
							} );
						},
					} }
				/>
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
			formattedHeader={ <FormattedHeader headerText={ text } subHeaderText={ subText } /> }
			stepContent={
				<WPCOMDomainSearch flowName={ flow } config={ config } initialQuery={ initialQuery } />
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default DomainSearchStep;
