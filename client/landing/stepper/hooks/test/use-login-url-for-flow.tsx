/**
 * @jest-environment jsdom
 */
import React from 'react';
import { MemoryRouter } from 'react-router';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { addQueryArgs } from '../../../../lib/route';
import { type Flow } from '../../declarative-flow/internals/types';
import { useLoginUrlForFlow } from '../use-login-url-for-flow';

const flow = { name: 'some-flow', title: 'some-title' } as Flow;

describe( 'useLoginUrlForFlow', () => {
	const Wrapper =
		( basename ) =>
		( { children } ) => {
			const base = basename || 'setup';
			return (
				<MemoryRouter basename={ base } initialEntries={ [ `/${ base }/site-migration-flow` ] }>
					{ children }
				</MemoryRouter>
			);
		};

	it( 'returns the login URL redirecting to the current step', () => {
		const { result } = renderHookWithProvider( () => useLoginUrlForFlow( { flow } ), {
			wrapper: Wrapper( 'setup' ),
		} );

		expect( result.current ).toEqual(
			addQueryArgs(
				{
					variationName: 'some-flow',
					redirect_to: '/setup/site-migration-flow',
					pageTitle: 'some-title',
					toStepper: true,
				},
				'/start/account/user-social'
			)
		);
	} );

	it( 'returns the login with with extra params', () => {
		const flowWithExtraParams = {
			...flow,
			useLoginParams: () => ( {
				foo: 'bar',
				bar: 'baz',
			} ),
		} satisfies Flow;

		const { result } = renderHookWithProvider(
			() => useLoginUrlForFlow( { flow: flowWithExtraParams } ),
			{
				wrapper: Wrapper( 'setup' ),
			}
		);

		expect( result.current ).toEqual(
			addQueryArgs( '/start/account/user-social', {
				variationName: 'some-flow',
				redirect_to: '/setup/site-migration-flow',
				pageTitle: 'some-title',
				toStepper: true,
				foo: 'bar',
				bar: 'baz',
			} )
		);
	} );

	// Inside the react-router-dom the useLocation.pathname doesn't include the basename
	it( 'returns the login URL for the flow considering the basename', () => {
		const { result } = renderHookWithProvider( () => useLoginUrlForFlow( { flow } ), {
			wrapper: Wrapper( 'crazy-setup' ),
		} );

		expect( result.current ).toEqual(
			addQueryArgs(
				{
					variationName: 'some-flow',
					redirect_to: '/crazy-setup/site-migration-flow',
					pageTitle: 'some-title',
					toStepper: true,
				},
				'/start/account/user-social'
			)
		);
	} );
} );
