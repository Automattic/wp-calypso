/**
 * @jest-environment jsdom
 */

import { mount } from 'enzyme';
import { Component } from 'react';
import { asyncLoader } from '../';

const runAfterEvents = ( f ) =>
	new Promise( ( r ) =>
		setTimeout( () => {
			f();
			r();
		}, 0 )
	);

test( 'creates wrapped components only on state change', async () => {
	let mountCount = 0;
	let renderCount = 0;

	class Success extends Component {
		componentDidMount() {
			mountCount++;
		}

		render() {
			renderCount++;

			return null;
		}
	}

	let resolver;
	const Loader = asyncLoader( {
		promises: { yes: new Promise( ( r ) => ( resolver = r ) ) },
		loading: () => null,
		success: () => <Success />,
		failure: () => null,
	} );

	const mounted = mount( <Loader /> );
	expect( mountCount ).toBe( 0 );
	expect( renderCount ).toBe( 0 );

	// trigger promise resolution
	resolver();

	await runAfterEvents( () => {
		expect( mountCount ).toBe( 1 );
		expect( renderCount ).toBe( 1 );
	} );

	// trigger a re-render
	mounted.setProps( { test: true } );

	await runAfterEvents( () => {
		expect( mountCount ).toBe( 1 );
		expect( renderCount ).toBe( 2 );
	} );
} );
