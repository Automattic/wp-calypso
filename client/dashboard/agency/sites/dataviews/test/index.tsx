/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { render } from '../../../../test-utils';
import { useAgencyFields } from '../index';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

describe( 'useAgencyFields', () => {
	// DataViews renders `field.render` as a component, so a new field on every
	// render remounts every cell (and reloads every grid preview).
	test( 'keeps the same fields across renders', async () => {
		const renders: Field< AgencySite >[][] = [];

		function Fields() {
			const [ count, setCount ] = useState( 0 );
			renders.push( useAgencyFields( { viewType: 'grid' } ) );
			return <button onClick={ () => setCount( count + 1 ) }>Rerender { count }</button>;
		}

		render( <Fields /> );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Rerender 0' } ) );
		await screen.findByRole( 'button', { name: 'Rerender 1' } );

		const first = renders[ 0 ];
		const last = renders[ renders.length - 1 ];
		expect( last ).toBe( first );
		last.forEach( ( field, index ) => expect( field.render ).toBe( first[ index ].render ) );
	} );
} );
