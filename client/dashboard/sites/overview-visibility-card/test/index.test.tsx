/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import VisibilityCard from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	launch_status: 'unlaunched',
	capabilities: { manage_options: true },
	options: { site_intent: 'build' },
} as Site;

// ExPlat reads a cached assignment from localStorage before asking the server.
const assignPublishCopyVariation = ( variationName: string ) =>
	window.localStorage.setItem(
		'explat-experiment--calypso_site_launch_publish_copy_202610_v1',
		JSON.stringify( {
			experimentName: 'calypso_site_launch_publish_copy_202610_v1',
			variationName,
			retrievedTimestamp: Date.now(),
			ttl: 3600,
		} )
	);

const mockLaunchpad = ( completed: boolean ) =>
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/launchpad` )
		.query( true )
		.reply( 200, {
			checklist: [
				{ id: 'setup_general', title: 'Give your site a name', completed: true },
				{ id: 'site_launched', title: 'Launch your site', completed },
			],
		} );

describe( '<VisibilityCard>', () => {
	afterEach( () => {
		window.localStorage.clear();
	} );

	test( 'says "Launch site" once setup is complete, in the copy experiment control', async () => {
		assignPublishCopyVariation( 'control' );
		mockLaunchpad( true );

		render( <VisibilityCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: 'Launch site' } ) ).toBeVisible();
	} );

	test( 'says "Publish site" once setup is complete, in the copy experiment treatment', async () => {
		assignPublishCopyVariation( 'treatment' );
		mockLaunchpad( true );

		render( <VisibilityCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: 'Publish site' } ) ).toBeVisible();
	} );

	test( 'keeps "Coming soon" while setup is incomplete, in the copy experiment treatment', async () => {
		assignPublishCopyVariation( 'treatment' );
		mockLaunchpad( false );

		render( <VisibilityCard site={ site } /> );

		expect( await screen.findByRole( 'heading', { name: 'Coming soon' } ) ).toBeVisible();
	} );
} );
