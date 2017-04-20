/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import FlexboxGrid from '../';

describe( 'FlexboxGrid', () => {
	const cellRenderer = ( { index, key, style } ) => {
		return (
			<div key={ key } style={ style }>{ index }</div>
		);
	};

	it( 'should render a static flexbox grid if no width is provided', () => {
		const grid = shallow(
			<FlexboxGrid
				minColumnWidth={ 200 }
				cellRenderer={ cellRenderer }
				scrollTop={ 0 }
				columnCount={ 2 }
				rowCount={ 2 } />
		);

		expect( grid.prop( 'style' ) ).to.eql( {} );

		const content = grid.find( 'div.flexbox-grid__content' );

		expect( content.prop( 'style' ) ).to.eql( {} );

		const cells = content.children();

		expect( cells.length ).to.equal( 4 );

		expect( cells.at( 0 ).text() ).to.equal( '0' );
		expect( cells.at( 1 ).text() ).to.equal( '1' );
		expect( cells.at( 2 ).text() ).to.equal( '2' );
		expect( cells.at( 3 ).text() ).to.equal( '3' );

		expect( cells.at( 0 ).prop( 'style' ) ).to.eql( { flex: '1 0 200px' } );
		expect( cells.at( 1 ).prop( 'style' ) ).to.eql( { flex: '1 0 200px' } );
		expect( cells.at( 2 ).prop( 'style' ) ).to.eql( { flex: '1 0 200px' } );
		expect( cells.at( 3 ).prop( 'style' ) ).to.eql( { flex: '1 0 200px' } );
	} );

	it( 'should render an absolutely positioned grid if width is provided', () => {
		global.window = { innerHeight: 1000 };

		const grid = shallow(
			<FlexboxGrid
				width={ 900 }
				minColumnWidth={ 200 }
				cellRenderer={ cellRenderer }
				scrollTop={ 0 }
				columnCount={ 4 }
				rowCount={ 2 }
				rowHeight={ 100 } />
		);

		expect( grid.prop( 'style' ) ).to.eql( { height: '200px' } );

		const content = grid.find( 'div.flexbox-grid__content' );

		expect( content.prop( 'style' ) ).to.eql( {
			position: 'absolute',
			top: '0px',
			left: 0
		} );
	} );

	it( 'should render only the visible cells', () => {
		global.window = { innerHeight: 400 };

		const grid = shallow(
			<FlexboxGrid
				width={ 900 }
				minColumnWidth={ 200 }
				cellRenderer={ cellRenderer }
				scrollTop={ 150 }
				columnCount={ 4 }
				rowCount={ 100 }
				rowHeight={ 100 } />
		);

		expect( grid.prop( 'style' ) ).to.eql( { height: '10000px' } );

		const content = grid.find( 'div.flexbox-grid__content' );

		expect( content.prop( 'style' ) ).to.eql( {
			position: 'absolute',
			top: '100px',
			left: 0
		} );

		const cells = content.children();

		expect( cells.length ).to.equal( 20 );

		expect( cells.at( 0 ).text() ).to.equal( '4' );
		expect( cells.at( 19 ).text() ).to.equal( '23' );
	} );

	it( 'should pre-render additional rows if overscanRowCount is given', () => {
		global.window = { innerHeight: 400 };

		const grid = shallow(
			<FlexboxGrid
				width={ 900 }
				minColumnWidth={ 200 }
				cellRenderer={ cellRenderer }
				scrollTop={ 1050 }
				columnCount={ 4 }
				rowCount={ 100 }
				rowHeight={ 100 }
				overscanRowCount={ 3 } />
		);

		expect( grid.prop( 'style' ) ).to.eql( { height: '10000px' } );

		const content = grid.find( 'div.flexbox-grid__content' );

		expect( content.prop( 'style' ) ).to.eql( {
			position: 'absolute',
			top: '700px',
			left: 0
		} );

		const cells = content.children();

		expect( cells.length ).to.equal( 44 );

		expect( cells.at( 0 ).text() ).to.equal( '28' );
		expect( cells.at( 43 ).text() ).to.equal( '71' );
	} );
} );
