import { useSelector } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getPurchaseURLCallback } from '../get-purchase-url-callback';
import ProductCard from '../product-card';
import { Duration, QueryArgs, SelectorProduct } from '../types';
import useStorageUpgradesToDisplay from './hooks/use-storage-upgrades-to-display';

import './style.scss';

interface Props {
	duration: Duration;
	urlQueryArgs: QueryArgs;
	siteSlug?: string;
}

export const StorageTierUpgrade: React.FC< Props > = ( {
	duration,
	urlQueryArgs,
	siteSlug: siteSlugProp,
} ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlugState = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const siteSlug = siteSlugProp || siteSlugState || '';
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const storageUpgrades = useStorageUpgradesToDisplay( siteId as number, duration );

	const noop = () => {
		// Do nothing
	};

	const createButtonURL = getPurchaseURLCallback( siteSlug, urlQueryArgs );

	return (
		<div className="storage-tier-upgrade">
			{ storageUpgrades.map( ( product: SelectorProduct, index: number ) => (
				<ProductCard
					key={ index }
					item={ product }
					onClick={ noop }
					siteId={ siteId }
					currencyCode={ currencyCode }
					selectedTerm={ duration }
					isAligned={ false }
					scrollCardIntoView={ noop }
					createButtonURL={ createButtonURL }
				/>
			) ) }
		</div>
	);
};
