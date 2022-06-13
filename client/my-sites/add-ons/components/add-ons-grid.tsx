import styled from '@emotion/styled';
import AddOnCard from './add-ons-card';
import type { AddOnMeta } from '../hooks/use-add-ons';

interface Props {
	addOns: ( AddOnMeta | null )[];
	actionPrimary?: {
		text: string | React.ReactChild;
		handler: ( addOnSlug: string ) => void;
	};
	actionSelected?: {
		text: string | React.ReactChild;
		handler: ( addOnSlug: string ) => void;
	};
	// returns true/false if add-on is to be treated as "selected" (either added to cart, or part of plan, or ...)
	// can extend to return a "selected status" string, if we need to tailor
	useAddOnSelectedStatus?: ( addOnSlug: string ) => boolean;
	highlight: boolean;
}

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat( 1, 1fr );
	column-gap: 10px;
	row-gap: 1em;

	@media screen and ( min-width: 1080px ) {
		grid-template-columns: repeat( 2, 1fr );
	}
`;

const AddOnsGrid = ( {
	addOns,
	actionPrimary,
	actionSelected,
	useAddOnSelectedStatus,
	highlight,
}: Props ) => {
	return (
		<Grid>
			{ addOns.map( ( addOn ) =>
				addOn ? (
					<AddOnCard
						key={ addOn.slug }
						actionPrimary={ actionPrimary }
						actionSelected={ actionSelected }
						useAddOnSelectedStatus={ useAddOnSelectedStatus }
						{ ...addOn }
						highlight={ highlight ? addOn.highlight : false }
					/>
				) : null
			) }
		</Grid>
	);
};

export default AddOnsGrid;
