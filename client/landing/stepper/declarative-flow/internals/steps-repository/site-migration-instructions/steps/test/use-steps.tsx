/**
 * @jest-environment jsdom
 */
import { act, renderHook, render } from '@testing-library/react';
import { useSteps } from '../use-steps';

describe( 'useSteps', () => {
	const baseStepsOptions = {
		fromUrl: 'https://mytestsite.com',
		migrationKey: '123',
		onComplete: jest.fn(),
	};

	it( 'Should return 3 steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps ).toHaveLength( 3 );
	} );

	it( 'Should have the action labels as "Next" for the 2 first steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].expandable.action.label ).toEqual( 'Next' );
		expect( result.current.steps[ 1 ].expandable.action.label ).toEqual( 'Next' );
	} );

	it( 'Should have the last step action label as "Done"', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect(
			result.current.steps[ result.current.steps.length - 1 ].expandable.action.label
		).toEqual( 'Done' );
	} );

	it( 'Should start with the steps marked as not completed', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].task.completed ).toBeFalsy();
	} );

	it( 'Should mark step as completed after navigating through it', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		act( () => {
			result.current.steps[ 0 ].expandable.action.onClick();
		} );

		expect( result.current.steps[ 0 ].task.completed ).toBeTruthy();
	} );

	it( 'Should start with no completed steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.completedSteps ).toEqual( 0 );
	} );

	it( 'Should return the correct number of completed steps when navigating through them', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		act( () => {
			result.current.steps[ 0 ].expandable.action.onClick();
		} );

		expect( result.current.completedSteps ).toEqual( 1 );
	} );

	it( 'Should call onComplete after calling the action of the last step', () => {
		const onCompleteMock = jest.fn();

		const options = {
			...baseStepsOptions,
			onComplete: onCompleteMock,
		};

		const { result } = renderHook( () => useSteps( options ) );

		act( () => {
			result.current.steps[ 2 ].expandable.action.onClick();
		} );

		expect( onCompleteMock ).toHaveBeenCalled();
	} );

	it( 'Should start with the first step open', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].expandable.isOpen ).toBeTruthy();
	} );

	it( 'Should have only the current step as open', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].expandable.isOpen ).toBeTruthy();
		expect( result.current.steps[ 1 ].expandable.isOpen ).toBeFalsy();

		act( () => {
			result.current.steps[ 0 ].expandable.action.onClick();
		} );

		expect( result.current.steps[ 0 ].expandable.isOpen ).toBeFalsy();
		expect( result.current.steps[ 1 ].expandable.isOpen ).toBeTruthy();
	} );

	it( 'Should not allow navigate directly to a step when it was not completed yet', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].onClick ).toBeUndefined();
		expect( result.current.steps[ 1 ].onClick ).toBeUndefined();
	} );

	it( 'Should allow to navigate directly to already visited steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		// Navigate through the action button to the next step.
		act( () => {
			result.current.steps[ 0 ].expandable.action.onClick();
		} );

		expect( result.current.steps[ 0 ].expandable.isOpen ).toBeFalsy();

		// Navigate directly to the first step.
		act( () => {
			result.current.steps[ 0 ].onClick!();
		} );

		expect( result.current.steps[ 0 ].expandable.isOpen ).toBeTruthy();

		// Navigate directly to the second which was already visited.
		act( () => {
			result.current.steps[ 1 ].onClick!();
		} );

		expect( result.current.steps[ 1 ].expandable.isOpen ).toBeTruthy();
	} );

	it( 'Should have a link to migrate guru plugin on the source site on the first step', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		const { getByRole } = render( result.current.steps[ 0 ].expandable.content );

		const link = getByRole( 'link', {
			name: /Migrate Guru plugin/,
		} );

		expect( link.getAttribute( 'href' ) ).toEqual(
			`${ baseStepsOptions.fromUrl }/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term`
		);
	} );

	it( 'Should have generic link to migrate guru plugin on the first step when the from is empty', () => {
		const { result } = renderHook( () => useSteps( { ...baseStepsOptions, fromUrl: '' } ) );

		const { getByRole } = render( result.current.steps[ 0 ].expandable.content );

		const link = getByRole( 'link', {
			name: /Migrate Guru plugin/,
		} );

		expect( link.getAttribute( 'href' ) ).toEqual( 'https://wordpress.org/plugins/migrate-guru/' );
	} );

	it( 'Should have a link to migrate guru screen on the source site on the second step', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		const { getByRole } = render( result.current.steps[ 1 ].expandable.content );

		const link = getByRole( 'link', {
			name: /Migrate Guru plugin screen on your source site/,
		} );

		expect( link.getAttribute( 'href' ) ).toEqual(
			`${ baseStepsOptions.fromUrl }/wp-admin/admin.php?page=migrateguru`
		);
	} );

	it( 'Should have a text about migrate guru screen on the source site on the second step when the from is empty', () => {
		const { result } = renderHook( () => useSteps( { ...baseStepsOptions, fromUrl: '' } ) );

		const { getByText } = render( result.current.steps[ 1 ].expandable.content );

		const text = getByText( 'Migrate Guru plugin screen on your source site' );

		expect( text.tagName ).toEqual( 'STRONG' );
	} );
} );
