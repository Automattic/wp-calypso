/**
 * @jest-environment jsdom
 */
/* eslint-disable import/no-extraneous-dependencies */
import { Button } from '@automattic/components';
import { shallow } from 'enzyme';
import { BackButton, Props } from '../back-button';

const mockHistoryPush = jest.fn();
const mockHistoryGoBack = jest.fn();
jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useHistory: () => ( {
		push: mockHistoryPush,
		goBack: mockHistoryGoBack,
	} ),
} ) );

function renderWrapper( props: Props ) {
	return shallow( <BackButton { ...props } /> );
}

describe( 'BackButton', () => {
	describe( 'when the user clicks the back button', () => {
		describe( 'and the system decides to navigate back home', () => {
			it( 'navigates back home', () => {
				const wrapper = renderWrapper( { backToRoot: true } );
				const button = wrapper.find( Button );
				button.simulate( 'click' );
				expect( mockHistoryPush.mock.calls.length ).toBe( 1 );
			} );
		} );

		describe( 'and the system decides to navigate to the previous page', () => {
			it( 'navigates to the previous page', () => {
				const wrapper = renderWrapper( { backToRoot: false } );
				const button = wrapper.find( Button );
				button.simulate( 'click' );
				expect( mockHistoryGoBack.mock.calls.length ).toBe( 1 );
			} );
		} );

		describe( 'and the system decides to navigate to a custom page', () => {
			it( 'navigates to the custom page', () => {
				const onClickSpy = jest.fn();
				const wrapper = renderWrapper( { onClick: onClickSpy } );

				const button = wrapper.find( Button );
				button.simulate( 'click' );

				expect( onClickSpy.mock.calls.length ).toBe( 1 );
			} );
		} );
	} );
} );
