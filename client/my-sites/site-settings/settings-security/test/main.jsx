/**
 * @vitest-environment jsdom
 */
import { PLAN_FREE } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SiteSettingsSecurity } from '../main';

const render = ( el, options ) => renderWithProvider( el, { ...options, reducers: { ui } } );

const props = {
	site: {
		plan: PLAN_FREE,
	},
	translate: ( x ) => x,
};

vi.mock( 'calypso/my-sites/site-settings/form-security', () => ( { default: () => null } ) );
vi.mock( 'calypso/my-sites/site-settings/jetpack-dev-mode-notice', () => ( {
	default: () => null,
} ) );
vi.mock( 'calypso/components/data/document-head', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/empty-content', () => ( {
	default: () => <div data-testid="empty-content" />,
} ) );

describe( 'SiteSettingsSecurity basic tests', () => {
	test( 'error page should not show if active security settings feature', () => {
		render( <SiteSettingsSecurity { ...props } hasSecuritySettings /> );
		expect( screen.queryByTestId( 'empty-content' ) ).not.toBeInTheDocument();
	} );
	test( 'error page should show if no active security settings feature', () => {
		render( <SiteSettingsSecurity { ...props } hasSecuritySettings={ false } /> );
		expect( screen.queryByTestId( 'empty-content' ) ).toBeVisible();
	} );
} );
