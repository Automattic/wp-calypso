// [TEMPORARY]: Button uses React.forwardRef, added in react@16.3.0 but not yet
// supported by Enzyme as of enzyme-adapter-react-16@1.1.1 . This mock unwraps
// the ref forwarding, so any tests relying on this behavior will fail.
//
// See: https://github.com/airbnb/enzyme/issues/1604
// See: https://github.com/airbnb/enzyme/pull/1592/files
jest.mock( '../../components/button', () => {
	const { Button: RawButton } = require.requireActual( '../../components/button' );
	const { Component } = require( 'react' );

	return class Button extends Component {
		render() {
			return RawButton( this.props );
		}
	};
} );

jest.mock( '@wordpress/api-request', () => {
	const apiRequest = jest.fn( () => {
		return apiRequest.mockReturnValue;
	} );
	apiRequest.mockReturnValue = 'mock this value by overriding apiRequest.mockReturnValue';

	return apiRequest;
} );
