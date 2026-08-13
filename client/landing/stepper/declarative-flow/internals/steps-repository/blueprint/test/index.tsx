/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import React from 'react';
import { useLocation } from 'react-router';
import {
	checkBlueprintExists,
	logBlueprintArchiveEvent,
} from 'calypso/landing/stepper/utils/blueprint-archive-import';
import BlueprintStep from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/utils/blueprint-archive-import', () => ( {
	checkBlueprintExists: jest.fn(),
	logBlueprintArchiveEvent: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// The router's search params are what navigation carries into the logged-out
// auth step, so the assertions below read them rather than window.location.
let currentSearch = '';
const LocationProbe = () => {
	currentSearch = useLocation().search;
	return null;
};

const render = ( initialEntry: string, submit: jest.Mock ) =>
	renderStep(
		<>
			<BlueprintStep { ...mockStepProps( { navigation: { submit } } ) } />
			<LocationProbe />
		</>,
		{ initialEntry }
	);

describe( 'BlueprintStep', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		currentSearch = '';
	} );

	it( 'keeps build_dest=wow when the blueprint has an archive', async () => {
		( checkBlueprintExists as jest.Mock ).mockResolvedValue( true );
		let searchAtSubmit = '';
		const submit = jest.fn( () => {
			searchAtSubmit = currentSearch;
		} );

		render( '/blueprint?blueprint=961&build_dest=wow', submit );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( checkBlueprintExists ).toHaveBeenCalledWith( '961' );
		expect( searchAtSubmit ).toContain( 'build_dest=wow' );
	} );

	it( 'strips build_dest from the router before submitting when the archive is missing', async () => {
		( checkBlueprintExists as jest.Mock ).mockResolvedValue( false );
		let searchAtSubmit = '';
		const submit = jest.fn( () => {
			searchAtSubmit = currentSearch;
		} );

		render( '/blueprint?blueprint=961&build_dest=wow', submit );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		// The fallback must be visible in the router's own params, otherwise the
		// logged-out auth branch re-adds build_dest after sign-in.
		expect( searchAtSubmit ).not.toContain( 'build_dest' );
		expect( searchAtSubmit ).toContain( 'blueprint=961' );
		expect( submit ).toHaveBeenCalledTimes( 1 );
		expect( logBlueprintArchiveEvent ).toHaveBeenCalledWith( 'wow_archive_missing', {
			blueprint: '961',
		} );
	} );

	it( 'does not look up an archive without build_dest=wow', async () => {
		const submit = jest.fn();

		render( '/blueprint?blueprint=941', submit );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( checkBlueprintExists ).not.toHaveBeenCalled();
	} );

	it( 'accepts a blueprint slug', async () => {
		( checkBlueprintExists as jest.Mock ).mockResolvedValue( true );
		const submit = jest.fn();

		render( '/blueprint?blueprint=coachava&build_dest=wow', submit );

		await waitFor( () => expect( submit ).toHaveBeenCalled() );
		expect( checkBlueprintExists ).toHaveBeenCalledWith( 'coachava' );
	} );
} );
