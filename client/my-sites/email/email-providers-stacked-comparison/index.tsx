import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	TITAN_MAIL_MONTHLY_SLUG,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { withShoppingCart } from '@automattic/shopping-cart';
import { translate, useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Main from 'calypso/components/main';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-stacked-comparison/billing-interval-toggle';
import GoogleWorkspaceCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/google-workspace-card';
import ProfessionalEmailCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/professional-email-card';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeOptions } from 'calypso/state/notices/types';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { InDepthComparison, ProviderComparison } from './in-depth-comparison';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

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

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const ProfessionalEmailComparisonObject: ProviderComparison = {
	header: <h1> Professional Email </h1>,
	tools: translate( 'Integrated email management, Inbox, calendar and contacts' ),
	storage: translate( '30 GB storage' ),
	importing: translate( 'One-click import of existing email and contacts' ),
	support: translate( '24/7 support via email' ),
	selectCallback: noop,
};

const GoogleWorkspaceComparisonObject: ProviderComparison = {
	header: <h1> Google </h1>,
	tools: translate( 'Gmail, Calendar, Meet, Chat, Drive, Docs, Sheets, Sliders and more' ),
	storage: translate( '30 GB storage' ),
	importing: translate( 'Easy to import' ),
	support: translate( '24/7 support via email' ),
	selectCallback: noop,
};

const EmailProvidersStackedComparison: FunctionComponent< EmailProvidersStackedComparisonProps > = (
	props
) => {
	const { comparisonContext, isGSuiteSupported, selectedDomainName, selectedSite, source } = props;

	const translate = useTranslate();

	const [ intervalLength, setIntervalLength ] = useState( IntervalLength.MONTHLY );

	const [ inDepthComparison, setInDepthComparison ] = useState( false );

	const [ detailsExpanded, setDetailsExpanded ] = useState( {
		titan: true,
		google: false,
	} );

	const onExpandedChange = ( providerKey: string, expand: boolean ) => {
		const detailsExpandedAsArray = Object.entries( detailsExpanded ).map( ( details ) => {
			const [ key, isExpanded ] = details;

			if ( expand ) {
				return [ key, key === providerKey ];
			}

			return [ key, key === providerKey ? expand : isExpanded ];
		} );

		if ( expand ) {
			recordTracksEvent( 'calypso_email_providers_expand_section_click', {
				provider: providerKey,
			} );
		}

		setDetailsExpanded( Object.fromEntries( detailsExpandedAsArray ) );
	};

	return (
		<Main className="email-providers-stacked-comparison__main" wideLayout>
			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<h1 className="email-providers-stacked-comparison__header wp-brand-font">
				{ translate( 'Pick an email solution' ) }
			</h1>

			<div className="email-providers-stacked-comparison__how-they-compare">
				{ translate( 'Not sure how to start?' ) }
				<Button
					borderless
					className="email-providers-stacked-comparison__how-they-compare-link"
					onClick={ () => setInDepthComparison( ! inDepthComparison ) }
				>
					{ translate( 'See how they compare.' ) }
				</Button>
			</div>

			<BillingIntervalToggle
				onIntervalChange={ setIntervalLength }
				intervalLength={ intervalLength }
			/>

			{ inDepthComparison && (
				<InDepthComparison
					comparisonObject={ [
						ProfessionalEmailComparisonObject,
						GoogleWorkspaceComparisonObject,
					] }
				/>
			) }

			{ ! inDepthComparison && (
				<ProfessionalEmailCard
					comparisonContext={ comparisonContext }
					detailsExpanded={ detailsExpanded.titan }
					selectedDomainName={ selectedDomainName }
					source={ source }
					intervalLength={ intervalLength }
					onExpandedChange={ onExpandedChange }
				/>
			) }

			{ ! inDepthComparison && isGSuiteSupported && (
				<GoogleWorkspaceCard
					comparisonContext={ comparisonContext }
					detailsExpanded={ detailsExpanded.google }
					selectedDomainName={ selectedDomainName }
					source={ source }
					intervalLength={ intervalLength }
					onExpandedChange={ onExpandedChange }
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
