/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

function Catalog( { className } ) {
	return (
		<div className={ className }>
			<h1>Stand-alone Component Catalog</h1>
		</div>
	);
}

const CatalogStyled = styled( Catalog )`
	margin: 1em;
	h1 {
		border-bottom: 1px solid #ccc;
	}
`;

ReactDOM.render( <CatalogStyled />, document.getElementById( 'root' ) );
