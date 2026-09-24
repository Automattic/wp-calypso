/**
 * @jest-environment jsdom
 */
import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import siteSettings from 'calypso/state/site-settings/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SeoVisibilityNotice from '../visibility-notice';

const siteId = 123456789;

const render = ( settings ) =>
	renderWithProvider( <SeoVisibilityNotice />, {
		reducers: { ui, siteSettings },
		initialState: {
			ui: { selectedSiteId: siteId },
			sites: { features: { [ siteId ]: { data: { active: [ FEATURE_ADVANCED_SEO ] } } } },
			siteSettings: { items: { [ siteId ]: settings } },
		},
	} );

describe( 'SeoVisibilityNotice', () => {
	test( 'names Coming Soon rather than Hidden for a coming soon site', () => {
		const { container } = render( { blog_public: 0, wpcom_coming_soon: 1 } );
		expect( container ).toHaveTextContent( 'while your site is Coming Soon' );
	} );

	test( 'renders nothing for a public site', () => {
		const { container } = render( { blog_public: 1, wpcom_coming_soon: 0 } );
		expect( container ).toBeEmptyDOMElement();
	} );
} );
