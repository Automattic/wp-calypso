import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import AddOnCard from 'calypso/sites/components/add-ons/add-ons-card';
import BundleAddOnCard from './bundle-add-on-card';
import StorageAddOnCard from './storage-add-ons-card';
import type { AnyAddOnMeta } from '@automattic/data-stores';
import type { Props as CardProps } from 'calypso/sites/components/add-ons/add-ons-card';
import type { SiteId } from 'calypso/types';

interface Props extends Omit< CardProps, 'addOnMeta' > {
	addOns: ( AnyAddOnMeta | null )[];
	siteId?: SiteId;
	storageOnly?: boolean;
}

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat( 1, 1fr );
	gap: 1em;

	@media screen and ( min-width: 1080px ) {
		grid-template-columns: repeat( 2, 1fr );
		gap: 1.5em;
	}
`;

const AddOnsGrid = ( {
	addOns,
	actionPrimary,
	actionSecondary,
	highlightFeatured,
	siteId,
	storageOnly,
}: Props ) => {
	const nonStorageAddOns = useMemo(
		() =>
			storageOnly ? [] : addOns.filter( ( addOn ) => addOn?.productSlug !== PRODUCT_1GB_SPACE ),
		[ addOns, storageOnly ]
	);
	return (
		<Container>
			{ nonStorageAddOns.map( ( addOn ) => {
				if ( ! addOn ) {
					return null;
				}

				if ( AddOns.isPluginAddOn( addOn ) ) {
					return siteId ? (
						<BundleAddOnCard
							key={ addOn.pluginSlug }
							addOnMeta={ addOn }
							siteId={ siteId }
							highlightFeatured={ highlightFeatured }
						/>
					) : null;
				}

				return (
					<AddOnCard
						key={
							addOn.quantity ? `${ addOn.productSlug }-${ addOn.quantity }` : addOn.productSlug
						}
						actionPrimary={ actionPrimary }
						actionSecondary={ actionSecondary }
						addOnMeta={ addOn }
						highlightFeatured={ highlightFeatured }
					/>
				);
			} ) }
			{ siteId && <StorageAddOnCard siteId={ siteId } actionPrimary={ actionPrimary } /> }
		</Container>
	);
};

export default AddOnsGrid;
