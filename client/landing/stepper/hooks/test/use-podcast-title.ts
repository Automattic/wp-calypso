/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react-hooks';
import usePodcastTitle from '../use-podcast-title';
import * as hook from '../use-podcast-title';

jest.mock( '../use-podcast-title' );

describe( 'use-podcast-title test', () => {
	test( 'Returns the correct title from the response', () => {
		const spy = jest.spyOn( hook, 'default' ).mockReturnValue( 'My Podcast Title' );
		const title = renderHook( () => usePodcastTitle() );

		expect( spy ).toHaveBeenCalled();
		expect( title.result.current ).toBe( 'My Podcast Title' );

		spy.mockRestore();
	} );
} );
