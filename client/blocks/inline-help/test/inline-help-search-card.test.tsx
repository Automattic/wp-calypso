/**
 * @vitest-environment jsdom
 */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { type Mock, vi } from 'vitest';
import InlineHelpSearchCard from '../inline-help-search-card';

const mockRecordTracksEvent = recordTracksEvent as Mock;

vi.mock( '@automattic/calypso-analytics', async () => ( {
	...( await vi.importActual< typeof import( '@automattic/calypso-analytics' ) >(
		'@automattic/calypso-analytics'
	) ),
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( 'calypso/components/search-card', () => ( {
	__esModule: true,
	default: ( { onSearch }: { onSearch: ( query: string ) => void } ) => (
		<input
			aria-label="search"
			onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
				onSearch( event.target.value )
			}
		/>
	),
} ) );

const renderCard = ( blogId?: number ) =>
	render(
		<InlineHelpSearchCard
			searchQuery=""
			location="help-center"
			sectionName="help-center"
			useSearchControl={ false }
			blogId={ blogId }
			siteContextSource="explicit"
		/>
	);

describe( 'InlineHelpSearchCard', () => {
	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
	} );

	it( 'tracks explicit site attribution', () => {
		renderCard( 123 );

		fireEvent.change( screen.getByRole( 'textbox', { name: 'search' } ), {
			target: { value: 'domains' },
		} );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_inlinehelp_search',
			expect.objectContaining( {
				blog_id: 123,
				site_context_source: 'explicit',
			} )
		);
	} );

	it( 'does not infer site attribution when site is absent', () => {
		renderCard();

		fireEvent.change( screen.getByRole( 'textbox', { name: 'search' } ), {
			target: { value: 'domains' },
		} );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_inlinehelp_search',
			expect.objectContaining( { site_context_source: 'none' } )
		);
		expect( mockRecordTracksEvent.mock.calls[ 0 ][ 1 ] ).not.toHaveProperty( 'blog_id' );
	} );
} );
