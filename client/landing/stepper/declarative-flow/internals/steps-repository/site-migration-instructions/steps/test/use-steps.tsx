/**
 * @jest-environment jsdom
 */
import { act, fireEvent, renderHook, render } from '@testing-library/react';
import { useSteps } from '../use-steps';

const siteUrl = 'https://staging.wordpress.com';
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

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => ( { URL: siteUrl } ),
} ) );

describe( 'Steps', () => {
	it( 'Should return 3 steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps ).toHaveLength( 3 );
	} );

	it( 'Should start with the first step open', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].expandable?.isOpen ).toBeTruthy();
	} );

	it( 'Should have only the current step as open', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		expect( result.current.steps[ 0 ].expandable?.isOpen ).toBeTruthy();
		expect( result.current.steps[ 1 ].expandable?.isOpen ).toBeFalsy();

		fireEvent.click( getByRole( 'button', { name: /Next/ } ) );

		expect( result.current.steps[ 0 ].expandable?.isOpen ).toBeFalsy();
		expect( result.current.steps[ 1 ].expandable?.isOpen ).toBeTruthy();
	} );

	it( 'Should start with each step marked as not completed', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].task.completed ).toBeFalsy();
	} );

	it( 'Should start with no completed steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.completedSteps ).toEqual( 0 );
	} );

	it( 'Should mark step as completed after navigating through it', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		fireEvent.click( getByRole( 'button', { name: /Next/ } ) );

		expect( result.current.steps[ 0 ].task.completed ).toBeTruthy();
	} );

	it( 'Should not allow navigating directly to a step when it was not completed yet', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );

		expect( result.current.steps[ 0 ].onClick ).toBeUndefined();
		expect( result.current.steps[ 1 ].onClick ).toBeUndefined();
	} );

	it( 'Should return the correct number of completed steps when navigating through them', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		fireEvent.click( getByRole( 'button', { name: /Next/ } ) );

		expect( result.current.completedSteps ).toEqual( 1 );
	} );

	it( 'Should call onComplete after calling the action of the last step', () => {
		const onCompleteMock = jest.fn();
		const options = {
			...baseStepsOptions,
			onComplete: onCompleteMock,
		};
		const { result } = renderHook( () => useSteps( options ) );
		const { getByRole } = render( result.current.steps[ 2 ].expandable?.content );

		fireEvent.click( getByRole( 'button', { name: /Done/ } ) );

		expect( onCompleteMock ).toHaveBeenCalled();
	} );

	it( 'Should enable navigating directly to already visited steps', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		// Navigate through the action button to the next step.
		fireEvent.click( getByRole( 'button', { name: /Next/ } ) );

		expect( result.current.steps[ 0 ].expandable?.isOpen ).toBeFalsy();

		// Navigate directly to the first step.
		act( () => {
			result.current.steps[ 0 ].onClick!();
		} );

		expect( result.current.steps[ 0 ].expandable?.isOpen ).toBeTruthy();

		// Navigate directly to the second which was already visited.
		act( () => {
			result.current.steps[ 1 ].onClick!();
		} );

		expect( result.current.steps[ 1 ].expandable?.isOpen ).toBeTruthy();
	} );
} );

describe( 'Step 1 - Install the Migrate to WordPress.com plugin', () => {
	it( 'Should render the "Install plugin" and "Next" buttons in the first step', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		expect( getByRole( 'button', { name: /Install plugin/ } ) ).toBeInTheDocument();
		expect( getByRole( 'button', { name: /Next/ } ) ).toBeInTheDocument();
	} );

	it( 'Should open the Migrate to WordPress.com plugin installation screen on the source site when the "Install plugin" button is clicked', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		window.open = jest.fn();
		fireEvent.click( getByRole( 'button', { name: /Install plugin/ } ) );

		expect( window.open ).toHaveBeenCalledWith(
			`${ baseStepsOptions.fromUrl }/wp-admin/plugin-install.php?s=%2522wpcom%2520migration%2522&tab=search&type=term`,
			'_blank'
		);
	} );
} );

describe( 'Step 2 - Get your site ready', () => {
	it( 'Should render the "Get started" and "Next" buttons in the second step', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 1 ].expandable?.content );

		expect( getByRole( 'button', { name: /Get started/ } ) ).toBeInTheDocument();
		expect( getByRole( 'button', { name: /Next/ } ) ).toBeInTheDocument();
	} );

	it( 'Should open the Migrate to WordPress.com plugin page on the source site when the "Get started" button is clicked', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 1 ].expandable?.content );

		window.open = jest.fn();
		fireEvent.click( getByRole( 'button', { name: /Get started/ } ) );

		expect( window.open ).toHaveBeenCalledWith(
			`${ baseStepsOptions.fromUrl }/wp-admin/admin.php?page=wpcom-migration`,
			'_blank'
		);
	} );
} );

describe( 'Step 3 - Add your migration key', () => {
	it( 'Should not render any buttons if the migration key is not set and the fallback is not displayed', () => {
		const { result } = renderHook( () => useSteps( { ...baseStepsOptions, migrationKey: '' } ) );
		const { queryByRole } = render( result.current.steps[ 2 ].expandable?.content );

		expect( queryByRole( 'button', { name: /Get key/ } ) ).not.toBeInTheDocument();
		expect( queryByRole( 'button', { name: /Done/ } ) ).not.toBeInTheDocument();
	} );

	it( 'Should render the "Get key" and "Done" buttons if the migration key is not set and the fallback is displayed', () => {
		const { result } = renderHook( () =>
			useSteps( { ...baseStepsOptions, migrationKey: '', showMigrationKeyFallback: true } )
		);
		const { getByRole } = render( result.current.steps[ 2 ].expandable?.content );

		expect( getByRole( 'button', { name: /Get key/ } ) ).toBeInTheDocument();
		expect( getByRole( 'button', { name: /Done/ } ) ).toBeInTheDocument();
	} );

	it( 'Should render the "Done" button if the migration key is set', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 2 ].expandable?.content );

		expect( getByRole( 'button', { name: /Done/ } ) ).toBeInTheDocument();
	} );

	it( 'Should open the Migrate to WordPress.com plugin page on the new site when the "Get key" button is clicked', () => {
		const { result } = renderHook( () =>
			useSteps( { ...baseStepsOptions, migrationKey: '', showMigrationKeyFallback: true } )
		);
		const { getByRole } = render( result.current.steps[ 2 ].expandable?.content );

		window.open = jest.fn();
		fireEvent.click( getByRole( 'button', { name: /Get key/ } ) );

		expect( window.open ).toHaveBeenCalledWith(
			`${ siteUrl }/wp-admin/admin.php?page=wpcom-migration`,
			'_blank'
		);
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

describe( 'Unknown source site', () => {
	beforeAll( () => ( baseStepsOptions.fromUrl = '' ) );

	it( 'Should open the plugin page on WordPress.org when the "Install plugin" button is clicked', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { getByRole } = render( result.current.steps[ 0 ].expandable?.content );

		window.open = jest.fn();
		fireEvent.click( getByRole( 'button', { name: /Install plugin/ } ) );

		expect( window.open ).toHaveBeenCalledWith(
			'https://wordpress.org/plugins/wpcom-migration/',
			'_blank'
		);
	} );

	it( 'Should not render the "Get started" button', () => {
		const { result } = renderHook( () => useSteps( baseStepsOptions ) );
		const { queryByRole } = render( result.current.steps[ 1 ].expandable?.content );

		expect( queryByRole( 'button', { name: /Get started/ } ) ).not.toBeInTheDocument();
		expect( queryByRole( 'button', { name: /Next/ } ) ).toBeInTheDocument();
	} );

	it( 'Should not render any buttons on the migration key step if the migration key is not set and the fallback is not displayed', () => {
		const { result } = renderHook( () => useSteps( { ...baseStepsOptions, migrationKey: '' } ) );
		const { queryByRole } = render( result.current.steps[ 2 ].expandable?.content );

		expect( queryByRole( 'button', { name: /Get key/ } ) ).not.toBeInTheDocument();
		expect( queryByRole( 'button', { name: /Done/ } ) ).not.toBeInTheDocument();
	} );
} );
