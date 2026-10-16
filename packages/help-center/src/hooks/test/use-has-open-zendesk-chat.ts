/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useGetSupportInteractions } from '../use-get-support-interactions';
import { useHasOpenZendeskChat } from '../use-has-open-zendesk-chat';

jest.mock( '../use-get-support-interactions', () => ( {
	useGetSupportInteractions: jest.fn(),
} ) );

const withInteractions = ( data: Array< { status: string } > | undefined, isLoading = false ) =>
	( useGetSupportInteractions as jest.Mock ).mockReturnValue( { data, isLoading } );

describe( 'useHasOpenZendeskChat', () => {
	it( 'is true when one of the Zendesk interactions is open', () => {
		withInteractions( [ { status: 'solved' }, { status: 'open' } ] );

		const { result } = renderHook( () => useHasOpenZendeskChat() );

		expect( result.current ).toEqual( { hasOpenZendeskChat: true, isLoading: false } );
		expect( useGetSupportInteractions ).toHaveBeenCalledWith( 'zendesk' );
	} );

	it( 'is false when every Zendesk interaction is solved or closed', () => {
		withInteractions( [ { status: 'solved' }, { status: 'closed' } ] );

		const { result } = renderHook( () => useHasOpenZendeskChat() );

		expect( result.current.hasOpenZendeskChat ).toBe( false );
	} );

	it( 'is false, and says so, while the interactions are loading', () => {
		withInteractions( undefined, true );

		const { result } = renderHook( () => useHasOpenZendeskChat() );

		expect( result.current ).toEqual( { hasOpenZendeskChat: false, isLoading: true } );
	} );
} );
