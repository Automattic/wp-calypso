/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';

export default function GridRow( { gap, columnWidths, className, children } ) {
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

const Row = styled.div`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: ${( props ) => props.columnWidths.replace( ' ', ' ' + props.gap + ' ' )};
	grid-template-columns: ${( props ) => props.columnWidths};
	grid-column-gap: ${( props ) => props.gap};
	justify-items: stretch;
`;
