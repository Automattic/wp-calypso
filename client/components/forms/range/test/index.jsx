/**
 * @jest-environment jsdom
 */

import { Gridicon } from '@automattic/components';
import { render } from '@testing-library/react';
import FormRange from '../';

describe( 'index', () => {
	test( 'should render beginning content if passed a `minContent` prop', () => {
		const { container } = render( <FormRange minContent={ <Gridicon icon="minus-small" /> } /> );

		expect( container.querySelector( '.gridicons-minus-small' ) ).toBeVisible();
	} );

	test( 'should not render ending content if not passed a `maxContent` prop', () => {
		const { container } = render( <FormRange minContent={ <Gridicon icon="minus-small" /> } /> );
		const content = container.querySelectorAll( '.range__content' );

		expect( content ).toHaveLength( 1 );
		expect( content[ 0 ] ).toHaveClass( 'is-min' );
	} );

	test( 'should render ending content if passed a `maxContent` prop', () => {
		const { container } = render( <FormRange maxContent={ <Gridicon icon="plus-small" /> } /> );

		expect( container.querySelector( '.gridicons-plus-small' ) ).toBeVisible();
	} );

	test( 'should not render beginning content if not passed a `minContent` prop', () => {
		const { container } = render( <FormRange maxContent={ <Gridicon icon="plus-small" /> } /> );
		const content = container.querySelectorAll( '.range__content' );

		expect( content ).toHaveLength( 1 );
		expect( content[ 0 ] ).toHaveClass( 'is-max' );
	} );

	test( 'should render a value label if passed a truthy `showValueLabel` prop', () => {
		const { container } = render( <FormRange value={ 8 } showValueLabel readOnly /> );

		expect( container.querySelector( '.range__label' ) ).toHaveTextContent( '8' );
	} );
} );
