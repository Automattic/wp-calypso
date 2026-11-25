/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import SiteStatusContent from '../site-status-content';

vi.mock( 'react', async () => ( {
	...( await vi.importActual( 'react' ) ),
	useContext: vi.fn().mockReturnValue( {} ),
} ) );
vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual( 'react-redux' ) ),
	useSelector: vi.fn().mockReturnValue( () => null ),
	useDispatch: vi.fn().mockReturnValue( () => {} ),
} ) );
vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual( 'i18n-calypso' ) ),
	useTranslate: vi.fn().mockReturnValue( ( str ) => str ),
} ) );
vi.mock( '../site-set-favorite' );

describe( 'SiteStatusContent', () => {
	it( 'renders the correct Activity Log link for sites with a path component', () => {
		const SITE_URL = 'https://mycoolsite.example/wordpress';

		const props = {
			rows: {
				site: {
					value: {
						url: SITE_URL,
					},
				},
				monitor: {
					error: {},
				},
				scan: {
					threats: 0,
				},
				plugin: {
					updates: 0,
				},
				backup: {},
			},
			type: 'site',
			isLargeScreen: true,
			siteError: false,
		};

		render( <SiteStatusContent { ...props } /> );
		const button = screen.getByText( SITE_URL, { role: 'button' } );
		const href = button.getAttribute( 'href' );
		expect( href ).toBe( '/activity-log/mycoolsite.example::wordpress' );
	} );
} );
