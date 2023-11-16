/**
 * @jest-environment jsdom
 */
import { render, fireEvent, getByText, getByTestId, queryByText } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CookieBanner } from '..';
import type { CookieBannerProps } from '..';

const genericContent: CookieBannerProps[ 'content' ] = {
	simpleConsent: {
		description: 'simple description',
		acceptAllButton: 'acceptAllButton',
		customizeButton: 'customizeButton',
	},
	customizedConsent: {
		description: 'customized description',
		categories: {
			essential: {
				name: 'essential name',
				description: 'essential description',
			},
			analytics: {
				name: 'analytics name',
				description: 'analytics description',
			},
			advertising: {
				name: 'advertising name',
				description: 'advertising description',
			},
		},
		acceptSelectionButton: 'acceptSelectionButton',
	},
};

describe( 'CookieBanner', () => {
	test( 'renders in simple consent correctly', () => {
		const { container } = render(
			<CookieBanner content={ genericContent } onAccept={ jest.fn } />
		);

		expect( getByText( container, 'acceptAllButton' ) ).toBeInTheDocument();
		expect( getByText( container, 'customizeButton' ) ).toBeInTheDocument();
		expect( container ).toMatchSnapshot();
	} );
	test( 'renders in customized consent correctly (after customize button click)', () => {
		const { container } = render(
			<CookieBanner content={ genericContent } onAccept={ jest.fn } />
		);
		fireEvent.click( getByText( container, 'customizeButton' ) );

		expect( getByText( container, 'acceptSelectionButton' ) ).toBeInTheDocument();
		expect( queryByText( container, 'customizeButton' ) ).not.toBeInTheDocument();
		expect( container ).toMatchSnapshot();
	} );
	test( 'fires onAccept with all buckets true (on accept all button click)', () => {
		const onAccept = jest.fn();
		const { container } = render(
			<CookieBanner content={ genericContent } onAccept={ onAccept } />
		);

		fireEvent.click( getByText( container, 'acceptAllButton' ) );
		expect( onAccept ).toHaveBeenCalledWith( {
			essential: true,
			analytics: true,
			advertising: true,
		} );
	} );
	test( 'fires onAccept with default selection (all true except advertising) (when no change is done in customized consent)', () => {
		const onAccept = jest.fn();
		const { container } = render(
			<CookieBanner content={ genericContent } onAccept={ onAccept } />
		);
		fireEvent.click( getByText( container, 'customizeButton' ) );
		fireEvent.click( getByText( container, 'acceptSelectionButton' ) );

		expect( onAccept ).toHaveBeenCalledWith( {
			essential: true,
			analytics: true,
			advertising: false,
		} );
	} );
	test( 'fires onAccept with correct selection (when change is done in customized consent)', () => {
		const onAccept = jest.fn();
		const { container } = render(
			<CookieBanner content={ genericContent } onAccept={ onAccept } />
		);
		fireEvent.click( getByText( container, 'customizeButton' ) );
		fireEvent.click( getByTestId( container, 'essential-bucket-toggle' ) );
		fireEvent.click( getByTestId( container, 'advertising-bucket-toggle' ) );

		fireEvent.click( getByText( container, 'acceptSelectionButton' ) );
		expect( onAccept ).toHaveBeenCalledWith( {
			essential: false,
			analytics: true,
			advertising: true,
		} );
	} );
} );
