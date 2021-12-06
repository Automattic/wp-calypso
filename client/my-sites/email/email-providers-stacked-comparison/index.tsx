import { withShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Main from 'calypso/components/main';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import { TITAN_MAIL_MONTHLY_SLUG, TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { Site } from 'calypso/reader/list-manage/types';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeOptions } from 'calypso/state/notices/types';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ProfessionalEmailCard from './provider-cards/professional-email-card';

import './style.scss';

type EmailProvidersStackedComparisonProps = {
	comparisonContext: string;
	cartDomainName?: string;
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
	selectedSite?: Site | null;
	selectedDomainName: string;
	source: string;
	titanMailProduct?: any;
};

const recordTracksEventAddToCartClick = (
	comparisonContext: string,
	validatedMailboxUuids: string[],
	mailboxesAreValid: boolean,
	source: string,
	userCanAddEmail: boolean,
	userCannotAddEmailReason: any
) => {
	recordTracksEvent( 'calypso_email_providers_add_click', {
		context: comparisonContext,
		mailbox_count: validatedMailboxUuids.length,
		mailboxes_valid: mailboxesAreValid ? 1 : 0,
		provider: TITAN_PROVIDER_NAME,
		source,
		user_can_add_email: userCanAddEmail,
		user_cannot_add_email_code: userCannotAddEmailReason ? userCannotAddEmailReason.code : '',
	} );
};

const EmailProvidersStackedComparison: FunctionComponent< EmailProvidersStackedComparisonProps > = (
	props
) => {
	const translate = useTranslate();
	const { comparisonContext, selectedDomainName, selectedSite, source } = props;

	return (
		<Main className={ 'email-providers-stacked-comparison__main' } wideLayout>
			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<h1 className="email-providers-stacked-comparison__header wp-brand-font">
				{ translate( 'Pick an email solution' ) }
			</h1>

			<ProfessionalEmailCard
				comparisonContext={ comparisonContext }
				recordTracksEventAddToCartClick={ recordTracksEventAddToCartClick }
				selectedDomainName={ selectedDomainName }
				source={ source }
			/>

			<> Google Workspace Component Placeholder </>
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
