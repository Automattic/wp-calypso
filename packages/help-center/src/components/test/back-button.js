/**
 * @jest-environment jsdom
 */
/* eslint-disable import/no-extraneous-dependencies */
import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { BackButton } from '../back-button.tsx';

const mockHistoryPush = jest.fn();
const mockHistoryGoBack = jest.fn();
jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useHistory: () => ( {
		push: mockHistoryPush,
		goBack: mockHistoryGoBack,
	} ),
} ) );

function renderWrapper( props ) {
	return shallow(
		<MemoryRouter>
			<BackButton { ...props } />
		</MemoryRouter>
	);
}

describe( 'BackButton', () => {
	describe( 'when the user clicks the back button', () => {
		describe( 'and the system decides to navigate back home', () => {
			it( 'navigates back home', () => {
				const wrapper = renderWrapper( { backToRoot: true } );
				const button = wrapper.find( BackButton ).dive();
				button.simulate( 'click' );
				expect( mockHistoryPush.mock.calls.length ).toBe( 1 );
			} );
		} );

		describe( 'and the system decides to navigate to the previous page', () => {
			it( 'navigates to the previous page', () => {
				const wrapper = renderWrapper( { backToRoot: false } );
				const button = wrapper.find( BackButton ).dive();
				button.simulate( 'click' );
				expect( mockHistoryGoBack.mock.calls.length ).toBe( 1 );
			} );
		} );

		describe( 'and the system decides to navigate to a custom page', () => {
			it( 'navigates to the custom page', () => {
				const onClickSpy = jest.fn();
				const wrapper = renderWrapper( { onClick: onClickSpy } );

				const button = wrapper.find( BackButton ).dive();
				button.simulate( 'click' );

				expect( onClickSpy.mock.calls.length ).toBe( 1 );
			} );
		} );
	} );
} );
