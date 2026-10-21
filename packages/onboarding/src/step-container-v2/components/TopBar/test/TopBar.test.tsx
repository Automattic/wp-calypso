import { fireEvent, render, screen } from '@testing-library/react';
import { StepContainerV2Provider } from '../../../contexts/StepContainerV2Context';
import { TopBar } from '../TopBar';
import '@testing-library/jest-dom';

describe( 'TopBar', () => {
	test( 'does not link the default logo by default', () => {
		render( <TopBar /> );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'links the default logo when logoHref is set', () => {
		render( <TopBar logoHref="https://wordpress.com/" /> );
		expect( screen.getByRole( 'link', { name: 'WordPress.com home' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/'
		);
	} );

	test( 'calls onLogoClick when the logo link is clicked', () => {
		const onLogoClick = jest.fn();
		render( <TopBar logoHref="#home" onLogoClick={ onLogoClick } /> );
		fireEvent.click( screen.getByRole( 'link', { name: 'WordPress.com home' } ) );
		expect( onLogoClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'never links a custom logo', () => {
		render( <TopBar logoHref="https://wordpress.com/" logo={ <span>Partner</span> } /> );
		expect( screen.getByText( 'Partner' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'never links a context logo', () => {
		render(
			<StepContainerV2Provider
				value={ {
					flowName: '',
					stepName: '',
					recordTracksEvent: () => {},
					logo: <span>Context logo</span>,
				} }
			>
				<TopBar logoHref="https://wordpress.com/" />
			</StepContainerV2Provider>
		);
		expect( screen.getByText( 'Context logo' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );
} );
