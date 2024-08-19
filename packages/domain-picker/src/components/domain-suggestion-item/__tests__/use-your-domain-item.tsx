import { render, screen, fireEvent } from '@testing-library/react';
import UseYourDomainItem from '../use-your-domain-item';

jest.mock( '@automattic/calypso-config', () => {
	function config() {
		return '';
	}
	function isEnabled() {
		return false;
	}
	config.isEnabled = isEnabled;

	return {
		default: config,
		isEnabled,
		__esModule: true,
	};
} );

describe( '<UseYourDomainItem />', () => {
	it( 'should render with correct messaging', () => {
		render( <UseYourDomainItem onClick={ jest.fn() } /> );

		expect( screen.getByText( 'Already own a domain?' ) ).toBeInTheDocument();
		expect( screen.getByText( "You can use it as your site's address." ) ).toBeInTheDocument();
	} );

	it( 'should fire onClick callback when the button is clicked', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Use a domain I own' } ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should fire onClick callback when the rest of the row is clicked', () => {
		const onClick = jest.fn();

		render( <UseYourDomainItem onClick={ onClick } /> );

		fireEvent.click( screen.getByText( 'Already own a domain?' ) );

		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
