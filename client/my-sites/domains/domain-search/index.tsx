import page from '@automattic/calypso-router';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo } from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import { useMyDomainInputMode } from '../../../components/domains/connect-domain-step/constants';
import { useSelector } from '../../../state';
import getCurrentQueryArguments from '../../../state/selectors/get-current-query-arguments';
import { domainAddEmailUpsell, domainUseMyDomain } from '../paths';

const FLOW_NAME = 'domains';

export default function DomainSearch() {
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

	return (
		<WPCOMDomainSearch
			currentSiteId={ selectedSite?.ID }
			currentSiteUrl={ selectedSite?.URL }
			flowName={ FLOW_NAME }
			initialQuery={ queryArguments?.suggestion.toString() ?? '' }
			config={ config }
			events={ events }
			flowAllowsMultipleDomainsInCart
		/>
	);
}
