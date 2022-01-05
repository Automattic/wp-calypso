import { isEnabled } from '@automattic/calypso-config';
import { withShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Main from 'calypso/components/main';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import EmailExistingForwardsNotice from 'calypso/my-sites/email/email-existing-forwards-notice';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-stacked-comparison/billing-interval-toggle';
import GoogleWorkspaceCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/google-workspace-card';
import ProfessionalEmailCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/professional-email-card';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import {
	emailManagementAddEmailForwards,
	emailManagementInDepthComparison,
} from 'calypso/my-sites/email/paths';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement } from 'react';

import './style.scss';

type EmailProvidersStackedComparisonProps = {
	cartDomainName?: string;
	comparisonContext: string;
	currencyCode?: string;
	currentRoute?: string;
	domain?: any;
	domainName?: string;
	domainsWithForwards?: string[];
	gSuiteProduct?: string;
	hasCartDomain?: boolean;
	isGSuiteSupported?: boolean;
	productsList?: string[];
	requestingSiteDomains?: boolean;
	selectedDomainName: string;
	selectedSite?: SiteData | null;
	shoppingCartManager?: any;
	showEmailForwardLink?: boolean;
	siteName: string;
	source: string;
};

const EmailProvidersStackedComparison: ReactElement< EmailProvidersStackedComparisonProps > | null = (
	props
) => {
	const {
		comparisonContext,
		currentRoute,
		domain,
		domainsWithForwards,
		isGSuiteSupported,
		selectedDomainName,
		selectedSite,
		showEmailForwardLink = true,
		siteName,
		source,
	} = props;

	const translate = useTranslate();

	const [ intervalLength, setIntervalLengthPure ] = useState( IntervalLength.ANNUALLY );

	const [ detailsExpanded, setDetailsExpanded ] = useState( {
		titan: true,
		google: false,
	} );

	const onExpandedStateChange = ( providerKey: string, isCurrentlyExpanded: boolean ) => {
		const expandedEntries = Object.entries( detailsExpanded ).map( ( entry ) => {
			const [ key, currentExpanded ] = entry;
			if ( isCurrentlyExpanded ) {
				return [ key, key === providerKey ];
			}
			return [ key, key === providerKey ? isCurrentlyExpanded : currentExpanded ];
		} );

		if ( isCurrentlyExpanded ) {
			recordTracksEvent( 'calypso_email_providers_expand_section_click', {
				provider: providerKey,
			} );
		}

		setDetailsExpanded( Object.fromEntries( expandedEntries ) );
	};

	const setIntervalLength = ( interval: IntervalLength ) => {
		if ( intervalLength === IntervalLength.ANNUALLY ) {
			setDetailsExpanded( { google: false, titan: true } );
		}
		setIntervalLengthPure( interval );
	};

	const showGoogleWorkspaceCard = intervalLength === IntervalLength.ANNUALLY && isGSuiteSupported;
	const hasExistingEmailForwards = hasEmailForwards( domain );

	return (
		<Main className="email-providers-stacked-comparison__main" wideLayout>
			<QueryProductsList />
			<QueryEmailForwards domainName={ selectedDomainName } />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<h1 className="email-providers-stacked-comparison__header wp-brand-font">
				{ translate( 'Pick an email solution' ) }
			</h1>

			{ isEnabled( 'emails/in-depth-comparison' ) && (
				<div className="email-providers-stacked-comparison__sub-header">
					{ translate( 'Not sure where to start? {{a}}See how they compare{{/a}}.', {
						components: {
							a: (
								<a
									href={ emailManagementInDepthComparison(
										siteName,
										selectedDomainName,
										currentRoute
									) }
								/>
							),
						},
					} ) }
				</div>
			) }

			<BillingIntervalToggle
				onIntervalChange={ setIntervalLength }
				intervalLength={ intervalLength }
			/>

			{ hasExistingEmailForwards && domainsWithForwards !== undefined && (
				<EmailExistingForwardsNotice
					domainsWithForwards={ domainsWithForwards }
					selectedDomainName={ selectedDomainName }
				/>
			) }

			<ProfessionalEmailCard
				comparisonContext={ comparisonContext }
				detailsExpanded={ detailsExpanded.titan }
				selectedDomainName={ selectedDomainName }
				source={ source }
				intervalLength={ intervalLength }
				onExpandedChange={ onExpandedStateChange }
			/>

			{ showGoogleWorkspaceCard && (
				<GoogleWorkspaceCard
					comparisonContext={ comparisonContext }
					detailsExpanded={ detailsExpanded.google }
					selectedDomainName={ selectedDomainName }
					source={ source }
					intervalLength={ intervalLength }
					onExpandedChange={ onExpandedStateChange }
				/>
			) }

			{ ! hasExistingEmailForwards && showEmailForwardLink && selectedSite && (
				<div className="email-providers-stacked-comparison__email-forward-section">
					{ translate( 'Looking for a free email solution?' ) }{ ' ' }
					{ translate( 'Start with {{link}}Email Forwarding{{/link}}.', {
						components: {
							link: (
								<a
									href={ emailManagementAddEmailForwards(
										selectedSite.slug,
										selectedDomainName,
										currentRoute,
										'purchase'
									) }
								/>
							),
						},
					} ) }
				</div>
			) }
		</Main>
	);
};

export default connect( ( state, ownProps: EmailProvidersStackedComparisonProps ) => {
	const selectedSite = getSelectedSite( state );
	const domains = getDomainsBySiteId( state, selectedSite?.ID );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: ownProps.selectedDomainName,
	} );

	const hasCartDomain = Boolean( ownProps.cartDomainName );

	const isGSuiteSupported =
		canUserPurchaseGSuite( state ) &&
		( hasCartDomain || ( domain && hasGSuiteSupportedDomain( [ domain ] ) ) );

	return {
		comparisonContext: ownProps.comparisonContext,
		currentRoute: getCurrentRoute( state ),
		domain,
		domainsWithForwards: getDomainsWithForwards( state, domains ),
		hasCartDomain,
		isGSuiteSupported,
		requestingSiteDomains: Boolean(
			selectedSite && isRequestingSiteDomains( state, selectedSite.ID )
		),
		selectedSite,
		source: ownProps.source,
	};
} )( withCartKey( withShoppingCart( EmailProvidersStackedComparison ) ) );
