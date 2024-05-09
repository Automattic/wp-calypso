/**
 * @jest-environment jsdom
 */
import { PLAN_FREE } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
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

jest.mock( 'calypso/my-sites/site-settings/form-security', () => () => null );
jest.mock( 'calypso/my-sites/site-settings/form-jetpack-monitor', () => () => null );
jest.mock( 'calypso/my-sites/site-settings/jetpack-dev-mode-notice', () => () => null );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/components/empty-content', () => () => <div data-testid="empty-content" /> );

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
