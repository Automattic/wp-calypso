/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import styled from '../lib/styled';

export default function GridRow( { gap, columnWidths, className, children }: GridRowProps ) {
	return (
		<Row gap={ gap } columnWidths={ columnWidths } className={ className }>
			{ children }
		</Row>
	);
}

GridRow.propTypes = {
	gap: PropTypes.string.isRequired,
	columnWidths: PropTypes.string.isRequired,
	className: PropTypes.string,
};

interface GridRowProps {
	className?: string;
	gap: string;
	columnWidths: string;
	children: React.ReactNode;
}

const Row = styled.div< GridRowProps & React.HTMLAttributes< HTMLDivElement > >`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: ${ ( props ) => props.columnWidths.replace( ' ', ' ' + props.gap + ' ' ) };
	grid-template-columns: ${ ( props ) => props.columnWidths };
	grid-column-gap: ${ ( props ) => props.gap };
	justify-items: stretch;
`;
