/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import A4APluginsJetpackBanner from '../plugins-jetpack-banner';

jest.mock( 'calypso/components/banner', () => ( {
	__esModule: true,
	default: ( { title, description }: { title: string; description: string } ) => (
		<section>
			<h2>{ title }</h2>
			<p>{ description }</p>
		</section>
	),
} ) );

const PRESSABLE_PERK = /Your Pressable plan includes Jetpack Complete for free/;

function renderBanner( pressable: { pressable_id: string; a4a_id: string | null } | null ) {
	const store = createStore( () => ( {
		a8cForAgencies: {
			agencies: {
				activeAgency: { third_party: pressable ? { pressable } : {} },
			},
		},
		preferences: { localValues: {}, remoteValues: {} },
	} ) );

	return render(
		<Provider store={ store }>
			<A4APluginsJetpackBanner />
		</Provider>
	);
}

describe( '<A4APluginsJetpackBanner>', () => {
	test( 'does not mention the Pressable perk to agencies without Pressable', () => {
		renderBanner( null );

		expect( screen.getByText( /Jetpack must be activated on each site/ ) ).toBeVisible();
		expect( screen.queryByText( PRESSABLE_PERK ) ).not.toBeInTheDocument();
	} );

	test( 'does not mention the Pressable perk to agencies with a regular Pressable plan', () => {
		renderBanner( { pressable_id: '123', a4a_id: null } );

		expect( screen.queryByText( PRESSABLE_PERK ) ).not.toBeInTheDocument();
	} );

	test( 'mentions the Pressable perk to agencies with an A4A Pressable plan', () => {
		renderBanner( { pressable_id: '123', a4a_id: '456' } );

		expect( screen.getByText( PRESSABLE_PERK ) ).toBeVisible();
	} );
} );
