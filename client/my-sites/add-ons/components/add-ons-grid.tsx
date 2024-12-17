import styled from '@emotion/styled';
import AddOnCard from './add-ons-card';
import type { Props as CardProps } from './add-ons-card';
import type { AddOnMeta } from '@automattic/data-stores';

interface Props extends Omit< CardProps, 'addOnMeta' > {
	addOns: ( AddOnMeta | null )[];
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

const AddOnsGrid = ( { addOns, actionPrimary, actionSecondary, highlightFeatured }: Props ) => {
	return (
		<Container>
			{ addOns.map( ( addOn ) =>
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
		</Container>
	);
};

export default AddOnsGrid;
