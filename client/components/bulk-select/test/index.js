/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkSelect } from '../index';

const noop = () => {};
const translate = ( string ) => string;

describe( 'index', () => {
	test( 'should have BulkSelect class', () => {
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 0 }
				totalElements={ 3 }
				onToggle={ noop }
			/>
		);
		expect( container.firstChild ).toHaveClass( 'bulk-select' );
	} );

	test( 'should not be checked when initialized without selectedElements', () => {
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 0 }
				totalElements={ 3 }
				onToggle={ noop }
			/>
		);
		expect( container.firstChild ).not.toHaveClass( 'is-checked' );
	} );

	test( 'should be checked when initialized with all elements selected', () => {
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 3 }
				totalElements={ 3 }
				onToggle={ noop }
			/>
		);
		expect( container.querySelectorAll( 'input:checked' ) ).toHaveLength( 1 );
	} );

	test( 'should not be checked when initialized with some elements selected', () => {
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 2 }
				totalElements={ 3 }
				onToggle={ noop }
			/>
		);
		expect( container.querySelectorAll( 'input:checked' ) ).toHaveLength( 0 );
	} );

	test( 'should render line gridicon when initialized with some elements selected', () => {
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 2 }
				totalElements={ 3 }
				onToggle={ noop }
			/>
		);
		expect( container.getElementsByClassName( 'bulk-select__some-checked-icon' ) ).toHaveLength(
			1
		);
	} );

	test( 'should add the aria-label to the input', () => {
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 2 }
				totalElements={ 3 }
				onToggle={ noop }
				ariaLabel="Select All"
			/>
		);
		expect( container.querySelectorAll( 'input' )[ 0 ] ).toHaveAttribute(
			'aria-label',
			'Select All'
		);
	} );

	test( 'should not mark the input readOnly', () => {
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 2 }
				totalElements={ 3 }
				onToggle={ noop }
			/>
		);
		// There is no prop readOnly, so this is null
		expect( container.querySelectorAll( 'input' )[ 0 ] ).not.toHaveAttribute( 'readonly' );
	} );

	test( 'should be call onToggle when clicked', async () => {
		const handleToggle = jest.fn();

		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 0 }
				totalElements={ 3 }
				onToggle={ handleToggle }
			/>
		);
		await userEvent.click( container.querySelectorAll( 'input' )[ 0 ] );
		expect( handleToggle ).toHaveBeenCalled();
	} );

	test( 'should be call onToggle with the new state when there are no selected elements', async () => {
		const onToggle = jest.fn();
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 0 }
				totalElements={ 3 }
				onToggle={ onToggle }
			/>
		);
		await userEvent.click( container.querySelectorAll( 'input' )[ 0 ] );
		expect( onToggle ).toHaveBeenCalledTimes( 1 );
		expect( onToggle ).toHaveBeenCalledWith( true );
	} );

	test( 'should be call onToggle with the new state when there are some selected elements', async () => {
		const onToggle = jest.fn();
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 1 }
				totalElements={ 3 }
				onToggle={ onToggle }
			/>
		);
		await userEvent.click( container.querySelectorAll( 'input' )[ 0 ] );
		expect( onToggle ).toHaveBeenCalledTimes( 1 );
		expect( onToggle ).toHaveBeenCalledWith( false );
	} );

	test( 'should be call onToggle with the new state when there all elements are selected', async () => {
		const onToggle = jest.fn();
		const { container } = render(
			<BulkSelect
				translate={ translate }
				selectedElements={ 3 }
				totalElements={ 3 }
				onToggle={ onToggle }
			/>
		);
		await userEvent.click( container.querySelectorAll( 'input' )[ 0 ] );
		expect( onToggle ).toHaveBeenCalledTimes( 1 );
		expect( onToggle ).toHaveBeenCalledWith( false );
	} );
} );
