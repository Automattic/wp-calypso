/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
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
		content_type: 'battlecard',
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

type LibraryProps = Omit< ResourceCenterProps, 'view' | 'onChangeView' >;

function Library( props: LibraryProps ) {
	const [ view, setView ] = useState( DEFAULT_VIEW );
	return <ResourceCenter view={ view } onChangeView={ setView } { ...props } />;
}

function renderLibrary( props: Partial< LibraryProps > = {} ) {
	const callbacks = { recordTracksEvent: jest.fn() };
	render( <Library resources={ resources } agencyId={ 1 } { ...callbacks } { ...props } /> );
	return callbacks;
}

function getCardTitles() {
	return screen.getAllByRole( 'heading', { level: 3 } ).map( ( heading ) => heading.textContent );
}

describe( '<ResourceCenter>', () => {
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

	test( 'narrows the results by stage, and records the change', async () => {
		const { recordTracksEvent } = renderLibrary();

		await userEvent.click(
			await screen.findByRole( 'radio', { name: 'Sell: Prepare for client conversations.' } )
		);

		expect( getCardTitles() ).toEqual( [ 'Jetpack battle card' ] );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_resource_center_view_change', {
			layout: 'grid',
			filters: 'stage:sell',
		} );
	} );

	test( "doesn't record searches", async () => {
		const { recordTracksEvent } = renderLibrary();

		await userEvent.type(
			await screen.findByRole( 'searchbox', { name: 'Search resources' } ),
			'compares'
		);

		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_a4a_resource_center_view_change',
			expect.anything()
		);
	} );

	test( 'leaves out the badges a resource has no value for', async () => {
		renderLibrary( { resources: [ resource( { audience: null } ) ] } );

		expect( await screen.findByText( 'Guide' ) ).toBeVisible();
		expect( screen.queryByText( 'All audiences' ) ).not.toBeInTheDocument();
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

	test( 'says when there are no resources at all', async () => {
		renderLibrary( { resources: [] } );

		expect( await screen.findByText( 'No resources yet' ) ).toBeVisible();
	} );

	test( 'links each resource to the resource itself, in a new tab', async () => {
		renderLibrary();

		const link = await screen.findByRole( 'link', { name: 'Jetpack battle card' } );
		expect( link ).toHaveAttribute( 'href', 'https://example.com/pressable.pdf' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	test( 'records opening a resource', async () => {
		const scope = nock( API )
			.post( '/wpcom/v2/agency/resources/record-event', {
				agency_id: 1,
				resource_id: 2,
				resource_name: 'Jetpack battle card',
			} )
			.reply( 200, { status: 'success' } );
		const { recordTracksEvent } = renderLibrary();

		await userEvent.click( await screen.findByRole( 'link', { name: 'Jetpack battle card' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_resource_center_browse_cta_click',
			{ resource_id: 2, resource_name: 'Jetpack battle card' }
		);
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	} );

	test( 'reveals more results on request', async () => {
		const { recordTracksEvent } = renderLibrary( {
			resources: Array.from( { length: 30 }, ( _, index ) =>
				resource( { id: index + 1, name: `Resource ${ index + 1 }` } )
			),
		} );

		expect( await screen.findByText( 'Showing 24 of 30 resources' ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Load more' } ) );

		expect( screen.getByText( 'Showing 30 of 30 resources' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Resource 25' } ) ).toHaveFocus();
		expect( screen.queryByRole( 'button', { name: 'Load more' } ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_resource_center_load_more' );
	} );
} );
