import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { type ResponseCartProduct, useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import QueryProductsList from '../../../components/data/query-products-list';
import QuerySiteDomains from '../../../components/data/query-site-domains';
import { useMyDomainInputMode } from '../../../components/domains/connect-domain-step/constants';
import { hasPlan } from '../../../lib/cart-values/cart-items';
import { useSelector } from '../../../state';
import getCurrentQueryArguments from '../../../state/selectors/get-current-query-arguments';
import getCurrentRoute from '../../../state/selectors/get-current-route';
import useCartKey from '../../checkout/use-cart-key';
import NewDomainsRedirectionNoticeUpsell from '../domain-management/components/domain/new-domains-redirection-notice-upsell';
import {
	domainAddEmailUpsell,
	domainManagementList,
	domainManagementTransferToOtherSite,
	domainUseMyDomain,
} from '../paths';

import './style.scss';

const FLOW_NAME = 'domains';

export default function DomainSearch() {
	const translate = useTranslate();
	const cartKey = useCartKey();
	const cart = useShoppingCart( cartKey );

	const queryArguments = useSelector( getCurrentQueryArguments );
	const selectedSite = useSelector( getSelectedSite );

	const tldQuery = queryArguments?.tld;

	const config = useMemo( () => {
		const allowedTlds = Array.isArray( tldQuery ) ? tldQuery : tldQuery?.split( ',' ) ?? [];

		return {
			vendor: getSuggestionsVendor( {
				isSignup: false,
				isDomainOnly: true,
				flowName: FLOW_NAME,
			} ),
			allowedTlds,
			skippable: false,
		};
	}, [ tldQuery ] );

	const selectedSiteSlug = selectedSite?.slug;

	const events = useMemo( () => {
		return {
			onMoveDomainToSiteClick( otherSiteDomain: string, domainName: string ) {
				page( domainManagementTransferToOtherSite( otherSiteDomain, domainName ) );
			},
			onExternalDomainClick: ( domainName?: string ) => {
				if ( ! selectedSiteSlug ) {
					throw new Error( 'Selected site slug is required' );
				}

				page(
					domainUseMyDomain( selectedSiteSlug, {
						domain: domainName,
						initialMode: useMyDomainInputMode.transferOrConnect,
					} )
				);
			},
			onContinue: ( items: ResponseCartProduct[] ) => {
				if ( items.length === 1 ) {
					page( domainAddEmailUpsell( selectedSiteSlug, items[ 0 ].meta ) );
				} else {
					page( `/checkout/${ selectedSiteSlug }` );
				}
			},
		};
	}, [ selectedSiteSlug ] );

	const currentRoute = useSelector( getCurrentRoute );
	const query = useSelector( getCurrentQueryArguments );

	const isFromMyHome = query?.from === 'my-home';

	const getBackButtonHref = () => {
		// If we have the from query param, we should use that as the back button href
		if ( isFromMyHome ) {
			return `/home/${ selectedSiteSlug }`;
		} else if ( query?.redirect_to ) {
			return query.redirect_to.toString();
		}

		return domainManagementList( selectedSiteSlug ?? undefined, currentRoute );
	};

	return (
		<Main className="main-column calypso-domain-search" wideLayout>
			<div>
				<BackButton className="domain-search__go-back" href={ getBackButtonHref() }>
					<Gridicon icon="arrow-left" size={ 18 } />
					{ translate( 'Back' ) }
				</BackButton>
				<FormattedHeader brandFont headerText={ translate( 'Search for a domain' ) } align="left" />
			</div>
			{ ! hasPlan( cart.responseCart ) && <NewDomainsRedirectionNoticeUpsell /> }
			<WPCOMDomainSearch
				className="domain-search--calypso"
				currentSiteId={ selectedSite?.ID }
				currentSiteUrl={ selectedSite?.URL }
				flowName={ FLOW_NAME }
				initialQuery={ queryArguments?.suggestion?.toString() ?? '' }
				config={ config }
				events={ events }
				flowAllowsMultipleDomainsInCart
			/>
			<QueryProductsList />
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ selectedSite?.ID && <QuerySiteDomains siteId={ selectedSite?.ID } /> }
		</Main>
	);
}
