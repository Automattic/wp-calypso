/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import SiteStatusContent from '../site-status-content';

jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useContext: jest.fn().mockReturnValue( {} ),
} ) );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn().mockReturnValue( () => null ),
	useDispatch: jest.fn().mockReturnValue( () => {} ),
} ) );
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn().mockReturnValue( ( str ) => str ),
} ) );
jest.mock( '../site-set-favorite' );

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

	it( 'renders a troubleshooting link for disconnected agency sites', () => {
		const SITE_URL = 'metalcoreminute.example';
		const SITE_ID = 987654321;

		const props = {
			rows: {
				site: {
					value: {
						blog_id: SITE_ID,
						url: SITE_URL,
					},
				},
				monitor: {
					error: false,
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
			siteError: true,
		};

		render( <SiteStatusContent { ...props } /> );
		const button = screen.getByText( SITE_URL, { role: 'button' } );
		const href = button.getAttribute( 'href' );
		expect( href ).toBe(
			`/settings/disconnect-site/${ SITE_URL }?site_id=${ SITE_ID }&site_url=${ SITE_URL }&type=down`
		);
	} );
} );
