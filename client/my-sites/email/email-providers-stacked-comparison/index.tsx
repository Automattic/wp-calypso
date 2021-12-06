import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	TITAN_MAIL_MONTHLY_SLUG,
} from '@automattic/calypso-products';
import { withShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Main from 'calypso/components/main';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { BillingSelector } from 'calypso/my-sites/email/email-providers-stacked-comparison/billing-selector/billing-selector';
import GoogleWorkspaceCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/google-workspace-card';
import ProfessionalEmailCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/professional-email-card';
import { TermLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeOptions } from 'calypso/state/notices/types';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

import './style.scss';

type EmailProvidersStackedComparisonProps = {
	cartDomainName?: string;
	comparisonContext: string;
	currencyCode?: string;
	currentRoute?: string;
	domain?: any;
	domainName?: string;
	domainsWithForwards?: any[];
	gSuiteProduct?: string;
	hasCartDomain?: boolean;
	isGSuiteSupported?: boolean;
	productsList?: string[];
	requestingSiteDomains?: boolean;
	shoppingCartManager?: any;
	selectedSite?: SiteData | null;
	selectedDomainName: string;
	source: string;
	titanMailMonthlyProduct?: any;
	gSuiteAnnualProduct?: any;
};

const EmailProvidersStackedComparison: FunctionComponent< EmailProvidersStackedComparisonProps > = (
	props
) => {
	const translate = useTranslate();
	const [ billingPeriod, setBillingPeriod ] = useState( TermLength.MONTHLY );
	const { comparisonContext, isGSuiteSupported, selectedDomainName, selectedSite, source } = props;
	const [ expanded, setExpanded ] = useState( {
		titan: true,
		google: false,
	} );

	const onExpandedStateChange = ( providerKey: string, isExpanded: boolean ) => {
		const expandedEntries = Object.entries( expanded ).map( ( entry ) => {
			const [ key, currentExpanded ] = entry;
			if ( isExpanded ) {
				return [ key, key === providerKey ];
			}
			return [ key, key === providerKey ? isExpanded : currentExpanded ];
		} );

		if ( isExpanded ) {
			recordTracksEvent( 'calypso_email_providers_expand_section_click', {
				provider: providerKey,
			} );
		}

		setExpanded( Object.fromEntries( expandedEntries ) );
	};

	return (
		<Main className="email-providers-stacked-comparison__main" wideLayout>
			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<h1 className="email-providers-stacked-comparison__header wp-brand-font">
				{ translate( 'Pick an email solution' ) }
			</h1>
			<BillingSelector onTermTypeChange={ setBillingPeriod } termLength={ billingPeriod } />
			<ProfessionalEmailCard
				comparisonContext={ comparisonContext }
				detailsExpanded={ expanded.titan }
				selectedDomainName={ selectedDomainName }
				source={ source }
				termLength={ billingPeriod }
				onExpandedChange={ onExpandedStateChange }
			/>

			{ isGSuiteSupported && (
				<GoogleWorkspaceCard
					comparisonContext={ comparisonContext }
					detailsExpanded={ expanded.google }
					selectedDomainName={ selectedDomainName }
					source={ source }
					termLength={ billingPeriod }
					onExpandedChange={ onExpandedStateChange }
				/>
			) }
		</Main>
	);
};

export default connect(
	( state, ownProps: EmailProvidersStackedComparisonProps ) => {
		const selectedSite = getSelectedSite( state );
		const domains = getDomainsBySiteId( state, selectedSite?.ID );
		const domain = getSelectedDomain( {
			domains,
			selectedDomainName: ownProps.selectedDomainName,
		} );

		const resolvedDomainName = domain ? domain.name : ownProps.selectedDomainName;
		const domainName = ownProps.cartDomainName ?? resolvedDomainName;
		const hasCartDomain = Boolean( ownProps.cartDomainName );

		const isGSuiteSupported =
			canUserPurchaseGSuite( state ) &&
			( hasCartDomain || ( domain && hasGSuiteSupportedDomain( [ domain ] ) ) );

		return {
			comparisonContext: ownProps.comparisonContext,
			domain,
			domainsWithForwards: getDomainsWithForwards( state, domains ),
			gSuiteAnnualProduct: getProductBySlug( state, GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY ),
			hasCartDomain,
			isGSuiteSupported,
			requestingSiteDomains: isRequestingSiteDomains( state, domainName ),
			selectedDomainName: domainName,
			selectedSite,
			source: ownProps.source,
			titanMailMonthlyProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
		};
	},
	( dispatch ) => {
		return {
			errorNotice: ( text: string, options: NoticeOptions ) =>
				dispatch( errorNotice( text, options ) ),
			getSiteDomains: ( siteId: number ) => dispatch( fetchSiteDomains( siteId ) ),
		};
	}
)( withCartKey( withShoppingCart( EmailProvidersStackedComparison ) ) );
