/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { render } from '../../../../test-utils';
import { DEFAULT_VIEW } from '../dataviews/views';
import ResourceCenter from '../resource-center';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { ComponentProps } from 'react';

const API = 'https://public-api.wordpress.com';

function resource( overrides: Partial< AgencyEnablementResource > = {} ) {
	return {
		id: 1,
		name: 'Pressable upsell patterns',
		description: 'When to recommend Pressable.',
		external_url: 'https://example.com/pressable.pdf',
		thumbnail_url: null,
		product: 'pressable',
		stage: 'grow',
		audience: 'all',
		content_type: 'guide',
		format: 'pdf',
		is_featured: false,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
		...overrides,
	} satisfies AgencyEnablementResource;
}

const resources = [
	resource(),
	resource( {
		id: 2,
		name: 'Jetpack battle card',
		description: 'How Jetpack compares.',
		product: 'jetpack',
		stage: 'sell',
		content_type: 'battle-card',
		created_at: '2026-02-01T00:00:00Z',
	} ),
	resource( {
		id: 3,
		name: 'Woo case study',
		description: 'A store that grew with WooCommerce.',
		product: 'woocommerce',
		stage: 'learn',
		content_type: 'case-study',
		is_featured: true,
	} ),
];

type ResourceCenterProps = ComponentProps< typeof ResourceCenter >;

type LibraryProps = Omit<
	ResourceCenterProps,
	'view' | 'onChangeView' | 'selectedId' | 'onSelectedIdChange'
> & { initialSelectedId?: number };

function Library( { initialSelectedId, ...props }: LibraryProps ) {
	const [ view, setView ] = useState( DEFAULT_VIEW );
	const [ selectedId, setSelectedId ] = useState( initialSelectedId ?? null );
	return (
		<ResourceCenter
			view={ view }
			onChangeView={ setView }
			selectedId={ selectedId }
			onSelectedIdChange={ setSelectedId }
			{ ...props }
		/>
	);
}

function renderLibrary( props: Partial< LibraryProps > = {} ) {
	const callbacks = {
		recordTracksEvent: jest.fn(),
		onResourceClick: jest.fn(),
	};
	render( <Library resources={ resources } { ...callbacks } { ...props } /> );
	return callbacks;
}

function getCardTitles() {
	return screen.getAllByRole( 'heading', { level: 3 } ).map( ( heading ) => heading.textContent );
}

describe( '<ResourceCenter>', () => {
	beforeEach( () => {
		nock( API )
			.persist()
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );
	} );

	test( 'lists top resources first, then the newest', async () => {
		renderLibrary();

		expect( await screen.findByRole( 'link', { name: 'Woo case study' } ) ).toBeVisible();
		expect( getCardTitles() ).toEqual( [
			'Woo case study',
			'Jetpack battle card',
			'Pressable upsell patterns',
		] );
		expect( screen.getByText( 'Showing 3 of 3 resources' ) ).toBeVisible();
	} );

	test( 'narrows the results with search', async () => {
		renderLibrary();

		await userEvent.type(
			await screen.findByRole( 'searchbox', { name: 'Search resources' } ),
			'compares'
		);

		expect( await screen.findByText( 'Showing 1 of 1 resource' ) ).toBeVisible();
		expect( getCardTitles() ).toEqual( [ 'Jetpack battle card' ] );
	} );

	test( 'narrows the results by stage', async () => {
		renderLibrary();

		await userEvent.click(
			await screen.findByRole( 'radio', { name: 'Sell: Prepare for client conversations.' } )
		);

		expect( getCardTitles() ).toEqual( [ 'Jetpack battle card' ] );
	} );

	test( "narrows the results by a card's badge", async () => {
		renderLibrary();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Filter by Learn' } ) );

		expect( getCardTitles() ).toEqual( [ 'Woo case study' ] );
	} );

	test( 'shows an empty state when nothing matches', async () => {
		renderLibrary();

		await userEvent.type(
			await screen.findByRole( 'searchbox', { name: 'Search resources' } ),
			'nothing like this'
		);

		expect(
			await screen.findByText( 'We couldn’t find any resources related to that.' )
		).toBeVisible();
	} );

	test( 'previews a resource, then records opening it', async () => {
		const { recordTracksEvent, onResourceClick } = renderLibrary();

		await userEvent.click( await screen.findByRole( 'link', { name: 'Jetpack battle card' } ) );

		const dialog = await screen.findByRole( 'dialog', { name: 'Jetpack battle card' } );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_resource_center_preview', {
			resource_id: 2,
			resource_name: 'Jetpack battle card',
		} );
		expect( onResourceClick ).not.toHaveBeenCalled();

		await userEvent.click( within( dialog ).getByRole( 'link', { name: 'Open in new tab' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_resource_center_browse_cta_click',
			{ resource_id: 2, resource_name: 'Jetpack battle card' }
		);
		expect( onResourceClick ).toHaveBeenCalledWith( expect.objectContaining( { id: 2 } ) );
	} );

	test( 'opens the resource a link names', async () => {
		renderLibrary( { initialSelectedId: 2 } );

		expect( await screen.findByRole( 'dialog', { name: 'Jetpack battle card' } ) ).toBeVisible();
	} );

	test( 'marks a resource as read in the user preferences', async () => {
		const scope = nock( API )
			.post( '/rest/v1.1/me/preferences', ( body ) => {
				expect( body ).toEqual( {
					calypso_preferences: { 'a4a-library-read-resources': [ 2 ] },
				} );
				return true;
			} )
			.reply( 200, { calypso_preferences: { 'a4a-library-read-resources': [ 2 ] } } );
		const { recordTracksEvent } = renderLibrary();

		await userEvent.click( await screen.findByRole( 'link', { name: 'Jetpack battle card' } ) );
		const dialog = await screen.findByRole( 'dialog', { name: 'Jetpack battle card' } );
		await userEvent.click( within( dialog ).getByRole( 'button', { name: 'Mark as read' } ) );

		expect( within( dialog ).getByRole( 'button', { name: 'Read' } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_resource_center_read_status_change',
			{ resource_id: 2, resource_name: 'Jetpack battle card', is_read: true }
		);
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'reveals more results on request', async () => {
		renderLibrary( {
			resources: Array.from( { length: 30 }, ( _, index ) =>
				resource( { id: index + 1, name: `Resource ${ index + 1 }` } )
			),
		} );

		expect( await screen.findByText( 'Showing 24 of 30 resources' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Load more' } ) );

		expect( screen.getByText( 'Showing 30 of 30 resources' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Load more' } ) ).not.toBeInTheDocument();
	} );
} );
