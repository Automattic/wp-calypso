import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import AddOnCard from 'calypso/sites/components/add-ons/add-ons-card';
import StorageAddOnCard from './storage-add-ons-card';
import type { AddOnMeta } from '@automattic/data-stores';
import type { Props as CardProps } from 'calypso/sites/components/add-ons/add-ons-card';
import type { SiteId } from 'calypso/types';

interface Props extends Omit< CardProps, 'addOnMeta' > {
	addOns: ( AddOnMeta | null )[];
	siteId?: SiteId;
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
}: Props ) => {
	const nonStorageAddOns = addOns.filter( ( addOn ) => addOn?.productSlug !== PRODUCT_1GB_SPACE );
	return (
		<Container>
			{ nonStorageAddOns.map( ( addOn ) =>
				addOn ? (
					<AddOnCard
						key={
							addOn.quantity ? `${ addOn.productSlug }-${ addOn.quantity }` : addOn.productSlug
						}
						actionPrimary={ actionPrimary }
						actionSecondary={ actionSecondary }
						addOnMeta={ addOn }
						highlightFeatured={ highlightFeatured }
					/>
				) : null
			) }
			{ siteId && <StorageAddOnCard siteId={ siteId } actionPrimary={ actionPrimary } /> }
		</Container>
	);
};

export default AddOnsGrid;
