import { Domain } from '@automattic/data-stores/dist/types/site';
import { withShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Main from 'calypso/components/main';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import GoogleWorkspaceCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/google-workspace-card';
import ProfessionalEmailCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/professional-email-card';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeOptions } from 'calypso/state/notices/types';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Site } from './provider-cards/provider-card-props';

import './style.scss';

type EmailProvidersStackedComparisonProps = {
	cartDomainName?: string;
	comparisonContext: string;
	currencyCode?: string;
	currentRoute?: string;
	domain?: any;
	domainName?: string;
	domainsWithForwards?: Domain[];
	gSuiteProduct?: string;
	hasCartDomain?: boolean;
	isGSuiteSupported?: boolean;
	productsList?: string[];
	requestingSiteDomains?: boolean;
	shoppingCartManager?: any;
	selectedSite?: Site | null;
	selectedDomainName: string;
	source: string;
	titanMailProduct?: any;
};

const EmailProvidersStackedComparison: FunctionComponent< EmailProvidersStackedComparisonProps > = (
	props
) => {
	const translate = useTranslate();
	const { comparisonContext, isGSuiteSupported, selectedSite, selectedDomainName, source } = props;

	return (
		<Main wideLayout>
			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<h1 className="email-providers-stacked-comparison__header wp-brand-font">
				{ translate( 'Pick and email solution' ) }
			</h1>

			<ProfessionalEmailCard
				comparisonContext={ comparisonContext }
				selectedDomainName={ selectedDomainName }
				source={ source }
			/>

			{ isGSuiteSupported && (
				<GoogleWorkspaceCard
					comparisonContext={ comparisonContext }
					selectedDomainName={ selectedDomainName }
					source={ source }
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
			selectedDomainName: domainName,
			domainsWithForwards: getDomainsWithForwards( state, domains ),
			hasCartDomain,
			isGSuiteSupported,
			requestingSiteDomains: isRequestingSiteDomains( state, domainName ),
			selectedSite,
			source: ownProps.source,
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
