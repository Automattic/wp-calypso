/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import SubpageWrapper from '../index';
import { ADD_FOWARDING_EMAIL } from '../subpages';

describe( 'SubpageWrapper', () => {
	it( 'should render the children', () => {
		render(
			<SubpageWrapper subpageKey={ ADD_FOWARDING_EMAIL }>
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );

	it( 'should render the children with the subpage header', () => {
		render(
			<SubpageWrapper subpageKey={ ADD_FOWARDING_EMAIL }>
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( screen.getByText( 'Add new email forwarding' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Seamlessly redirect your messages to where you need them.' )
		).toBeInTheDocument();
	} );

	it( 'should render the children without the subpage header', () => {
		render(
			<SubpageWrapper subpageKey="non-existent">
				<span>Hello</span>
			</SubpageWrapper>
		);

		expect( screen.getByText( 'Hello' ) ).toBeInTheDocument();
	} );
} );
