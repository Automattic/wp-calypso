import styled from '@emotion/styled';
import AddOnCard from './add-ons-card';
import type { AddOnMeta } from '../hooks/use-add-ons';
import type { Props as CardProps } from './add-ons-card';

interface Props extends Omit< CardProps, 'addOnMeta' > {
	addOns: ( AddOnMeta | null )[];
}

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat( 1, 1fr );
	gap: 1.5em;

	@media screen and ( min-width: 1080px ) {
		grid-template-columns: repeat( 2, 1fr );
	}
`;

const AddOnsGrid = ( {
	addOns,
	actionPrimary,
	actionSelected,
	useAddOnSelectedStatus,
	highlightFeatured,
}: Props ) => {
	return (
		<Container>
			{ addOns.map( ( addOn ) =>
				addOn ? (
					<AddOnCard
						key={ addOn.productSlug }
						actionPrimary={ actionPrimary }
						actionSelected={ actionSelected }
						useAddOnSelectedStatus={ useAddOnSelectedStatus }
						addOnMeta={ addOn }
						highlightFeatured={ highlightFeatured }
					/>
				) : null
			) }
		</Container>
	);
};

export default AddOnsGrid;
