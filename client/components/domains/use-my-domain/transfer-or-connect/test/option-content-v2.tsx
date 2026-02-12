/**
 * @jest-environment jsdom
 */

import { useLocalizeUrl } from '@automattic/i18n-utils';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OptionContentV2 from '../option-content-v2';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type OptionContentV2Props = Parameters< typeof OptionContentV2 >[ 0 ];
type SummaryButtonMockBadge = {
	text?: ReactNode;
	intent?: string;
};

type SummaryButtonMockProps = ComponentPropsWithoutRef< 'button' > & {
	title?: ReactNode;
	description?: ReactNode;
	decoration?: ReactNode;
	badges?: SummaryButtonMockBadge[];
};

jest.mock( '@automattic/components', () => {
	const ReactNamespace = require( 'react' );
	const SummaryButton = jest.fn(
		( { title, description, decoration, badges, ...buttonProps }: SummaryButtonMockProps ) =>
			ReactNamespace.createElement(
				'button',
				{ type: 'button', 'data-testid': 'summary-button', ...buttonProps },
				ReactNamespace.createElement( 'div', { 'data-testid': 'summary-button-title' }, title ),
				ReactNamespace.createElement(
					'div',
					{ 'data-testid': 'summary-button-description' },
					description
				),
				ReactNamespace.createElement(
					'div',
					{ 'data-testid': 'summary-button-decoration' },
					decoration
				),
				ReactNamespace.createElement(
					'div',
					{ 'data-testid': 'summary-button-badges' },
					badges?.map( ( badge, index ) =>
						ReactNamespace.createElement(
							'span',
							{ 'data-testid': 'summary-button-badge', key: `badge-${ index }` },
							badge.text
						)
					)
				)
			)
	);
	return {
		__esModule: true,
		SummaryButton,
		default: SummaryButton,
		Badge: ( { children, ...props }: { children?: ReactNode } & Record< string, unknown > ) =>
			ReactNamespace.createElement( 'span', { 'data-testid': 'badge', ...props }, children ),
		Gridicon: ( props: Record< string, unknown > ) =>
			ReactNamespace.createElement( 'span', { 'data-testid': 'gridicon', ...props } ),
	};
} );

const { SummaryButton: summaryButtonMock } = jest.requireMock( '@automattic/components' ) as {
	SummaryButton: jest.Mock;
};

jest.mock( '@automattic/i18n-utils', () => ( {
	useLocalizeUrl: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_x: ( text: string ) => text,
	isRTL: () => false,
} ) );

const useLocalizeUrlMock = useLocalizeUrl as jest.MockedFunction< typeof useLocalizeUrl >;
const localizeUrlMock = jest.fn( ( url: string ) => url );

const baseTitleText = 'Transfer or connect your domain';
const baseTopText = 'Bring your domain to WordPress.com';

const baseProps: OptionContentV2Props = {
	illustration: <div data-testid="illustration">Illustration</div>,
	titleText: baseTitleText,
	topText: baseTopText,
};

const renderOptionContent = ( props: Partial< OptionContentV2Props > = {} ) => {
	return render( <OptionContentV2 { ...baseProps } { ...props } /> );
};

describe( 'OptionContentV2', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		localizeUrlMock.mockImplementation( ( url: string ) => `localized-${ url }` );
		useLocalizeUrlMock.mockReturnValue( localizeUrlMock );
	} );

	it( 'renders recommended badge, top content, eta text, and benefits when provided', () => {
		const { getByText, getByTestId } = renderOptionContent( {
			recommended: true,
			etaText: 'Completes within 24 hours',
			benefits: [ 'Free privacy protection', 'Seamless transfer' ],
		} );

		expect( summaryButtonMock ).toHaveBeenCalledTimes( 1 );

		const [ summaryButtonProps ] = summaryButtonMock.mock.calls[ 0 ];

		expect( summaryButtonProps ).toEqual(
			expect.objectContaining( { className: 'option-content-v2__button' } )
		);
		expect( getByText( baseTitleText ) ).toBeVisible();
		expect( getByText( baseTopText ) ).toBeVisible();
		expect( getByText( 'Completes within 24 hours' ) ).toBeVisible();
		expect( getByText( 'Free privacy protection' ) ).toBeVisible();
		expect( getByText( 'Seamless transfer' ) ).toBeVisible();
		expect( getByText( 'Recommended' ) ).toBeVisible();
		expect( getByTestId( 'summary-button-decoration' ) ).toHaveTextContent( 'Illustration' );
	} );

	it( 'invokes onSelect when the summary button is clicked', async () => {
		const onSelect = jest.fn();
		const user = userEvent.setup();
		const { getByTestId } = renderOptionContent( { onSelect } );

		await user.click( getByTestId( 'summary-button' ) );

		expect( onSelect ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'disables the summary button when disabled prop is true', () => {
		const { getByTestId } = renderOptionContent( { disabled: true } );

		expect( getByTestId( 'summary-button' ) ).toBeDisabled();
	} );

	it( 'disables the summary button and applies placeholder styling when isPlaceholder is true', () => {
		const { container, getByTestId } = renderOptionContent( { isPlaceholder: true } );
		const wrapper = container.querySelector( '.option-content-v2' );

		expect( wrapper ).toHaveClass( 'option-content-v2--is-placeholder' );
		expect( getByTestId( 'summary-button' ) ).toBeDisabled();
	} );
} );
