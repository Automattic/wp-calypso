/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../';

describe( 'ProgressBar', () => {
	test( 'should show the title', () => {
		render( <ProgressBar value={ 20 } title="foo" /> );

		const progressBar = screen.getByRole( 'progressbar', { name: 'progress bar' } );

		expect( progressBar ).toBeVisible();
		expect( progressBar ).toHaveClass( 'progress-bar__progress' );
		expect( progressBar ).toHaveTextContent( 'foo' );
	} );

	test( 'should add is-pulsing class when isPulsing property is true', () => {
		const { container } = render( <ProgressBar value={ 20 } isPulsing /> );

		expect( container.firstChild ).toHaveClass( 'is-pulsing' );
	} );

	test( 'should not add is-pulsing class when isPulsing property is false', () => {
		const { container } = render( <ProgressBar value={ 20 } isPulsing={ false } /> );

		expect( container.firstChild ).not.toHaveClass( 'is-pulsing' );
	} );

	test( 'should add is-compact class when compact property is true', () => {
		const { container } = render( <ProgressBar value={ 20 } compact /> );

		expect( container.firstChild ).toHaveClass( 'is-compact' );
	} );

	test( 'should not add is-compact class when compact property is false', () => {
		const { container } = render( <ProgressBar value={ 20 } compact={ false } /> );

		expect( container.firstChild ).not.toHaveClass( 'is-compact' );
	} );

	test( 'should properly calculate the width percentage', () => {
		render( <ProgressBar value={ 20 } total={ 40 } /> );

		expect( screen.getByRole( 'progressbar', { name: 'progress bar' } ) ).toHaveStyle(
			'width: 50%'
		);
	} );

	test( 'should have correct aria values', () => {
		render( <ProgressBar value={ 20 } total={ 40 } /> );

		const progressBar = screen.getByRole( 'progressbar', { name: 'progress bar' } );

		expect( progressBar ).toHaveAttribute( 'aria-valuenow', '20' );
		expect( progressBar ).toHaveAttribute( 'aria-valuemax', '40' );
	} );

	test( 'should have the color provided by the color property', () => {
		render( <ProgressBar value={ 20 } color="red" /> );

		expect( screen.getByRole( 'progressbar', { name: 'progress bar' } ) ).toHaveStyle(
			'background-color: red'
		);
	} );

	test( 'should not be able to be more than 100% complete', () => {
		render( <ProgressBar value={ 240 } /> );
		expect( screen.getByRole( 'progressbar', { name: 'progress bar' } ) ).toHaveStyle(
			'width: 100%'
		);
	} );

	test( 'should never jump back', () => {
		const { container, rerender } = render( <ProgressBar value={ 10 } /> );

		const progressBar = screen.getByRole( 'progressbar', { name: 'progress bar' } );

		expect( progressBar ).toHaveStyle( 'width: 10%' );

		rerender( <ProgressBar value={ 20 } /> );

		expect( progressBar ).toHaveStyle( 'width: 20%' );

		rerender( <ProgressBar value={ 15 } /> );

		expect( progressBar ).toHaveStyle( 'width: 20%' );

		rerender( <ProgressBar value={ 30 } /> );

		expect( progressBar ).toHaveStyle( 'width: 30%' );

		expect( container.firstChild ).not.toHaveClass( 'is-pulsing' );

		rerender( <ProgressBar value={ 30 } isPulsing /> );

		expect( container.firstChild ).toHaveClass( 'is-pulsing' );
	} );
} );
