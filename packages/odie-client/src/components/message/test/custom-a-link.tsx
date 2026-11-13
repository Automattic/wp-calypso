/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import CustomALink from '../custom-a-link';

vi.mock( '@automattic/urls', () => ( {
	isThisASupportArticleLink: () => false,
} ) );

vi.mock( 'react-router-dom', () => ( {
	useNavigate: () => vi.fn(),
} ) );

vi.mock( '../../../context', () => ( {
	useOdieAssistantContext: () => ( { trackEvent: vi.fn() } ),
} ) );

const BLOB_URL = 'blob:http://calypso.localhost:3000/0b6f1d2e-7c3a-4b8e-9f10-2a3b4c5d6e7f';

describe( 'CustomALink', () => {
	it( 'saves a file the user just sent under its name', () => {
		render( <CustomALink href={ BLOB_URL }>report (1).zip</CustomALink> );

		const link = screen.getByRole( 'link', { name: 'report (1).zip' } );
		expect( link ).toHaveAttribute( 'href', BLOB_URL );
		expect( link ).toHaveAttribute( 'download', 'report (1).zip' );
	} );

	it( 'opens other links without downloading them', () => {
		render( <CustomALink href="https://example.com/report.zip">report.zip</CustomALink> );

		expect( screen.getByRole( 'link', { name: 'report.zip' } ) ).not.toHaveAttribute( 'download' );
	} );

	it( 'opens an image the user just sent in a new tab', () => {
		render(
			<CustomALink href={ BLOB_URL }>
				<img src={ BLOB_URL } alt="Screenshot" />
			</CustomALink>
		);

		const link = screen.getByRole( 'link', { name: 'Screenshot' } );
		expect( link ).not.toHaveAttribute( 'download' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );
} );
