import styled from '@emotion/styled';
import AddOnCard from './add-ons-card';
import type { AddOn } from '../hooks/use-add-ons';

interface Props {
	addOns: ( AddOn | null )[];
	actionPrimary?: {
		text: string;
		handler: ( slug: string ) => void;
	};
	actionSelected?: {
		text: string;
		handler: ( slug: string ) => void;
	};
	isAddOnSelected?: ( slug: string ) => boolean;
	highlight: boolean;
}

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat( 2, 1fr );
	column-gap: 10px;
	row-gap: 1em;
`;

const AddOnsGrid = ( {
	addOns,
	actionPrimary,
	actionSelected,
	isAddOnSelected,
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
						isSelected={ isAddOnSelected }
						{ ...addOn }
						highlight={ highlight ? addOn.highlight : false }
					/>
				) : null
			) }
		</Grid>
	);
};

export default AddOnsGrid;
