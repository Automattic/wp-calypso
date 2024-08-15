/**
 * @jest-environment jsdom
 */
import { renderHook, render } from '@testing-library/react';
import { useSteps } from '../use-steps';

describe( 'useSteps', () => {
	const baseStepsOptions = {
		fromUrl: 'https://mytestsite.com',
		lastCompleteStep: -1,
		migrationKey: '123',
		onComplete: jest.fn(),
		preparationError: null,
		setCurrentStep: jest.fn(),
		setLastCompleteStep: jest.fn(),
		showMigrationKeyFallback: false,
	};

	it( 'Should return 3 steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps ).toHaveLength( 3 );
	} );

	it( 'Should start with the steps marked as not completed', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].task.completed ).toBeFalsy();
	} );

	it( 'Should start with no completed steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.completedSteps ).toEqual( 0 );
	} );

	it( 'Should start with the first step open', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].expandable?.isOpen ).toBeTruthy();
	} );

	it( 'Should not allow navigate directly to a step when it was not completed yet', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].onClick ).toBeUndefined();
		expect( result.current.steps[ 1 ].onClick ).toBeUndefined();
	} );

	it( 'Should have a link to migrate guru plugin on the source site on the first step', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		const link = getByRole( 'link', {
			name: /Migrate Guru plugin/,
		} );

		expect( link.getAttribute( 'href' ) ).toEqual(
			`${ baseStepsOptions.fromUrl }/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term`
		);
	} );

	it( 'Should have generic link to migrate guru plugin on the first step when the from is empty', () => {
		const { result } = renderHook( () => useSteps( { ...baseStepsOptions, fromUrl: '' } ) );

		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		const link = getByRole( 'link', {
			name: /Migrate Guru plugin/,
		} );

		expect( link.getAttribute( 'href' ) ).toEqual( 'https://wordpress.org/plugins/migrate-guru/' );
	} );

	it( 'Should have a link to migrate guru screen on the source site on the second step', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		const { getByRole } = render( result.current.steps[ 1 ].expandable?.content );

		const link = getByRole( 'link', {
			name: /Migrate Guru plugin screen on your source site/,
		} );

		expect( link.getAttribute( 'href' ) ).toEqual(
			`${ baseStepsOptions.fromUrl }/wp-admin/admin.php?page=migrateguru`
		);
	} );

	it( 'Should have a text about migrate guru screen on the source site on the second step when the from is empty', () => {
		const { result } = renderHook( () => useSteps( { ...baseStepsOptions, fromUrl: '' } ) );

		const { getByText } = render( result.current.steps[ 1 ].expandable?.content );

		const text = getByText( 'Migrate Guru plugin screen on your source site' );

		expect( text.tagName ).toEqual( 'STRONG' );
	} );

	it( 'Should display the migration key field when the key is ready', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		const { getByRole } = render( result.current.steps[ 2 ].expandable?.content );

		expect( getByRole( 'textbox', { name: 'Migration key' } ) ).toBeInTheDocument();
	} );

	it( 'Should display waiting message when migration key is not ready', () => {
		const { result } = renderHook( () => useSteps( { ...baseStepsOptions, migrationKey: '' } ) );

		const { getByText } = render( result.current.steps[ 2 ].expandable?.content );

		expect(
			getByText( 'The key will be available here when your new site is ready.' )
		).toBeInTheDocument();
	} );
} );
