/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useGetSupportInteractions } from '../use-get-support-interactions';
import { useHasOpenZendeskChat } from '../use-has-open-zendesk-chat';

jest.mock( '../use-get-support-interactions', () => ( {
	useGetSupportInteractions: jest.fn(),
} ) );

const withInteractions = ( data: Array< { status: string } > | undefined ) =>
	( useGetSupportInteractions as jest.Mock ).mockReturnValue( { data } );

describe( 'useHasOpenZendeskChat', () => {
	it( 'is true when one of the Zendesk interactions is open', () => {
		withInteractions( [ { status: 'solved' }, { status: 'open' } ] );

		const { result } = renderHook( () => useHasOpenZendeskChat() );

		expect( result.current ).toBe( true );
		expect( useGetSupportInteractions ).toHaveBeenCalledWith( 'zendesk' );
	} );

	it( 'is false when every Zendesk interaction is solved or closed', () => {
		withInteractions( [ { status: 'solved' }, { status: 'closed' } ] );

		const { result } = renderHook( () => useHasOpenZendeskChat() );

		expect( result.current ).toBe( false );
	} );

	it( 'is false while the interactions are loading', () => {
		withInteractions( undefined );

		const { result } = renderHook( () => useHasOpenZendeskChat() );

		expect( result.current ).toBe( false );
	} );
} );
