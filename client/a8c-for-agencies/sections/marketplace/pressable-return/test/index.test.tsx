/**
 * @jest-environment jsdom
 */
import { useBreakpoint } from '@automattic/viewport-react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useDispatch } from 'calypso/state';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import PressableReturn from '..';
import usePressableReturn from '../use-pressable-return';
import type { ReactNode } from 'react';

jest.mock( '@automattic/viewport-react', () => ( { useBreakpoint: jest.fn() } ) );
jest.mock( 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour', () => ( {
	LayoutWithGuidedTour: ( { children }: { children: ReactNode } ) => <main>{ children }</main>,
} ) );
jest.mock(
	'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation',
	() => () => null
);
jest.mock( 'calypso/lib/detect-window-boundary', () => () => [ null, false ] );
jest.mock( 'calypso/state', () => ( { useDispatch: jest.fn() } ) );
jest.mock( 'calypso/state/analytics/actions', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '../use-pressable-return', () => jest.fn() );

const mockDispatch = jest.fn();
const retry = jest.fn();
const params = { agencyId: '42', referralId: '99', receiptId: '501' };

beforeEach( () => {
	jest.clearAllMocks();
	( useDispatch as jest.Mock ).mockReturnValue( mockDispatch );
	( useBreakpoint as jest.Mock ).mockReturnValue( false );
	( usePressableReturn as jest.Mock ).mockReturnValue( { isError: false, retry } );
} );

it( 'keeps the default agency return under Marketplace checkout', () => {
	render( <PressableReturn agencyId="42" receiptId="501" /> );
	expect( screen.getByRole( 'link', { name: 'Marketplace' } ) ).toHaveAttribute(
		'href',
		'/marketplace'
	);
	expect( screen.getByText( 'Checkout' ) ).toBeInTheDocument();
	expect( screen.queryByRole( 'link', { name: 'Your subscriptions' } ) ).not.toBeInTheDocument();
} );

it( 'keeps client SUCCESS navigation in subscriptions and passes only return parameters to the hook', () => {
	render( <PressableReturn { ...params } isClient /> );
	expect( screen.getByRole( 'link', { name: 'Your subscriptions' } ) ).toHaveAttribute(
		'href',
		'/client/subscriptions'
	);
	expect( screen.queryByRole( 'link', { name: 'Marketplace' } ) ).not.toBeInTheDocument();
	expect( screen.getByRole( 'status' ) ).toBeInTheDocument();
	expect( usePressableReturn ).toHaveBeenCalledWith( params );
} );

it( 'retains client navigation and visible mobile content when return context fails', () => {
	( useBreakpoint as jest.Mock ).mockReturnValue( true );
	( usePressableReturn as jest.Mock ).mockReturnValue( { isError: true, retry } );
	render( <PressableReturn isClient /> );
	expect( screen.getByRole( 'link', { name: 'Your subscriptions' } ) ).toHaveAttribute(
		'href',
		'/client/subscriptions'
	);
	expect( screen.queryByRole( 'link', { name: 'Marketplace' } ) ).not.toBeInTheDocument();
	expect( mockDispatch ).toHaveBeenCalledWith( setLayoutFocus( 'content' ) );
	fireEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
	expect( retry ).toHaveBeenCalledTimes( 1 );
} );
