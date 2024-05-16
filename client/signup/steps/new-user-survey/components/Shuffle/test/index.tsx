/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React, { ReactNode, useState } from 'react';
import Shuffle from '../index';

interface MockComponentProps {
	children?: ReactNode[];
	childOrderOverride?: string[] | null;
	ref?: React.Ref< any >;
	isShuffleActive?: boolean;
}
const DEBUG_PRINT_DIV_ID = 'render-order-print';
function MockComponent( { children, childOrderOverride, isShuffleActive }: MockComponentProps ) {
	const [ childOrder, setChildOrder ] = useState< string[] | null >( childOrderOverride ?? null );
	if ( children ) {
		return (
			<>
				<div data-testid={ DEBUG_PRINT_DIV_ID }>{ childOrder?.join( ',' ) }</div>
				<Shuffle
					isShuffleActive={ isShuffleActive }
					childOrder={ childOrder }
					getChildKey={ ( child: React.ReactNode ) => {
						// @ts-expect-error - Resolver does not have to have proper form
						return child.props.children[ 1 ].props.name ?? '';
					} }
					setChildOrder={ setChildOrder }
				>
					{ children }
				</Shuffle>
			</>
		);
	}
	return (
		<>
			<div data-testid={ DEBUG_PRINT_DIV_ID }>{ childOrder?.join( ',' ) }</div>
			<Shuffle
				childOrder={ childOrder }
				setChildOrder={ setChildOrder }
				getChildKey={ ( child: any ) => {
					return child.props.children[ 1 ].props.name;
				} }
				isShuffleActive={ isShuffleActive }
			>
				<label key={ 1 }>
					<span>Child 1</span>
					<input name="1" />
				</label>
				<label key={ 2 }>
					<span>Child 2</span>
					<input name="2" />
				</label>
				<label key={ 3 }>
					<span>Child 3</span>
					<input name="3" />
				</label>
				<label key={ 4 }>
					<span>Child 4</span>
					<input name="4" />
				</label>
				<label key={ 5 }>
					<span>Child 5</span>
					<input name="5" />
				</label>
			</Shuffle>
		</>
	);
}

describe( 'Shuffle Component', () => {
	test( 'Given an order of ids renders according to the given order', () => {
		const { getByTestId } = render(
			<MockComponent childOrderOverride={ [ '5', '4', '3', '2', '1' ] } isShuffleActive />
		);
		expect( getByTestId( '1' ) ).toHaveTextContent( 'Child 5' );
		expect( getByTestId( '2' ) ).toHaveTextContent( 'Child 4' );
		expect( getByTestId( '3' ) ).toHaveTextContent( 'Child 3' );
		expect( getByTestId( '4' ) ).toHaveTextContent( 'Child 2' );
		expect( getByTestId( '5' ) ).toHaveTextContent( 'Child 1' );
	} );

	test( 'Given no order renders a random order accurately', () => {
		const { getByTestId } = render( <MockComponent isShuffleActive /> );
		const debugPrint = getByTestId( DEBUG_PRINT_DIV_ID );
		const finalOrder = debugPrint.textContent?.split( ',' ) ?? [];

		finalOrder.forEach( ( id, i ) => {
			expect( getByTestId( String( i + 1 ) ) ).toHaveTextContent( `Child ${ id }` );
		} );
	} );

	test( 'If shuffle flag is disabled no change in order will occur', () => {
		const { getByTestId } = render( <MockComponent isShuffleActive={ false } /> );
		const debugPrint = getByTestId( DEBUG_PRINT_DIV_ID );

		expect( debugPrint.innerHTML ).toEqual( '1,2,3,4,5' );
		expect( getByTestId( '1' ) ).toHaveTextContent( 'Child 1' );
		expect( getByTestId( '2' ) ).toHaveTextContent( 'Child 2' );
		expect( getByTestId( '3' ) ).toHaveTextContent( 'Child 3' );
		expect( getByTestId( '4' ) ).toHaveTextContent( 'Child 4' );
		expect( getByTestId( '5' ) ).toHaveTextContent( 'Child 5' );
	} );
} );
