import { render } from '@testing-library/react';
import PanelGridicons from '../../../panel/templates/gridicons';
import AppGridicons from '../gridicons';
import type { ComponentType } from 'react';

type GridiconsComponent = ComponentType< { icon: string; size?: number } >;

describe( 'Gridicons', () => {
	it.each< [ string, GridiconsComponent ] >( [
		[ 'app', AppGridicons ],
		[ 'panel', PanelGridicons ],
	] )( 'uses the surrounding text color for %s notification icons', ( _name, Gridicons ) => {
		const { container } = render( <Gridicons icon="cart" /> );

		expect( container.querySelector( 'svg.gridicons-cart' ) ).toHaveAttribute(
			'fill',
			'currentColor'
		);
	} );
} );
