/**
 * @jest-environment jsdom
 */
import React from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationInstructions from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';
import { Sidebar } from '../sidebar';
import { SitePreview } from '../site-preview';

jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/data/site-migration/use-migration-sticker' );

( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
	deleteMigrationSticker: jest.fn(),
} );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 123,
} );

// Mock the hooks and components
jest.mock( 'calypso/data/site-migration/use-migration-sticker' );
jest.mock( 'calypso/landing/stepper/hooks/use-site' );
jest.mock( 'calypso/lib/analytics/tracks', () => {
	return {
		recordTracksEvent: jest.fn(),
	};
} );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 123,
} );

jest.mock( '../sidebar' );
jest.mock( '../site-preview' );

const FROM_URL = 'some-source-site-url.example.com';

describe( 'SiteMigrationInstructions', () => {
	const render = (
		props?: Partial< StepProps >,
		initialEntry = `/some-path?from=${ FROM_URL }`
	) => {
		const combinedProps = { ...mockStepProps( props ) };
		return renderStep( <SiteMigrationInstructions { ...combinedProps } />, {
			initialEntry,
		} );
	};

	beforeEach( () => {
		( useMigrationStickerMutation as jest.Mock ).mockReturnValue( {
			deleteMigrationSticker: jest.fn(),
		} );

		( Sidebar as jest.Mock ).mockImplementation( () => <div>Sidebar Component</div> );
		( SitePreview as jest.Mock ).mockImplementation( () => <div>SitePreview Component</div> );
	} );

	it( 'calls deleteMigrationSticker on mount', () => {
		const { deleteMigrationSticker } = useMigrationStickerMutation();

		render();

		expect( deleteMigrationSticker ).toHaveBeenCalledWith( 123 );
	} );
} );
