import styled from '@emotion/styled';
import type { PropsWithChildren } from 'react';

const Row = styled.div< GridRowProps & React.HTMLAttributes< HTMLDivElement > >`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: ${ ( props ) => props.columnWidths.replace( ' ', ' ' + props.gap + ' ' ) };
	grid-template-columns: ${ ( props ) => props.columnWidths };
	grid-column-gap: ${ ( props ) => props.gap };
	justify-items: stretch;
`;

export default function GridRow( {
	gap,
	columnWidths,
	className,
	children,
}: PropsWithChildren< GridRowProps > ) {
	return (
		<Row gap={ gap } columnWidths={ columnWidths } className={ className }>
			{ children }
		</Row>
	);
}

interface GridRowProps {
	className?: string;
	gap: string;
	columnWidths: string;
}
