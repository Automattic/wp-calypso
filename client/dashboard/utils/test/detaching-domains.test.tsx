/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import {
	markDomainDetaching,
	unmarkDomainDetaching,
	useDetachingDomains,
} from '../detaching-domains';

describe( 'detaching-domains store', () => {
	afterEach( () => {
		// The store is a module singleton; reset it between tests.
		act( () => {
			unmarkDomainDetaching( 'example.com' );
			unmarkDomainDetaching( 'other.com' );
		} );
	} );

	test( 'reflects a marked domain in the hook', () => {
		const { result } = renderHook( () => useDetachingDomains() );

		expect( result.current.has( 'example.com' ) ).toBe( false );

		act( () => markDomainDetaching( 'example.com' ) );

		expect( result.current.has( 'example.com' ) ).toBe( true );
	} );

	test( 'removes a domain when unmarked', () => {
		const { result } = renderHook( () => useDetachingDomains() );

		act( () => markDomainDetaching( 'example.com' ) );
		expect( result.current.has( 'example.com' ) ).toBe( true );

		act( () => unmarkDomainDetaching( 'example.com' ) );
		expect( result.current.has( 'example.com' ) ).toBe( false );
	} );

	test( 'tracks multiple domains independently', () => {
		const { result } = renderHook( () => useDetachingDomains() );

		act( () => {
			markDomainDetaching( 'example.com' );
			markDomainDetaching( 'other.com' );
		} );

		expect( result.current.has( 'example.com' ) ).toBe( true );
		expect( result.current.has( 'other.com' ) ).toBe( true );

		act( () => unmarkDomainDetaching( 'example.com' ) );

		expect( result.current.has( 'example.com' ) ).toBe( false );
		expect( result.current.has( 'other.com' ) ).toBe( true );
	} );

	test( 'produces a new snapshot on change so subscribers re-render', () => {
		const { result } = renderHook( () => useDetachingDomains() );
		const before = result.current;

		act( () => markDomainDetaching( 'example.com' ) );

		expect( result.current ).not.toBe( before );
	} );

	test( 'marking the same domain twice keeps a single entry and a stable snapshot', () => {
		const { result } = renderHook( () => useDetachingDomains() );

		act( () => markDomainDetaching( 'example.com' ) );
		const afterFirst = result.current;

		act( () => markDomainDetaching( 'example.com' ) );

		expect( result.current ).toBe( afterFirst );
		expect( result.current.has( 'example.com' ) ).toBe( true );
	} );
} );
