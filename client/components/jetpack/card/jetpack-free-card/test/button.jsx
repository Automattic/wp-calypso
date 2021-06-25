/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencides
 */
import { render as rtlRender, screen, fireEvent } from 'config/testing-library';
import JetpackFreeCardButton from '../button';
import { JPC_PATH_BASE } from 'calypso/jetpack-connect/constants';
import { PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import { SESSION_STORAGE_SELECTED_PLAN } from 'calypso/jetpack-connect/persistence-utils';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import * as analytics from 'calypso/state/analytics/actions/record';
import { reducer as ui } from 'calypso/state/ui/reducer';

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );

const siteId = 1;
const siteFragment = 'bored-sheep.jurassic.ninja';
const siteUrl = `https://${ siteFragment }`;
const adminUrl = `${ siteUrl }/wp-admin/`;
const jetpackAdminUrl = `${ adminUrl }admin.php?page=jetpack#/recommendations`;

const getLink = () => screen.getByRole( 'link' );
const getHref = () => getLink().getAttribute( 'href' );
const render = ( el, options ) => rtlRender( el, { ...options, reducers: { ui } } );

describe( 'JetpackFreeCardButton', () => {
	it( 'should link to the connect path in WordPress.com, for Jetpack cloud with no site in context', () => {
		const param = 'a';
		const value = 1;

		isJetpackCloud.mockReturnValue( true );
		render( <JetpackFreeCardButton urlQueryArgs={ { [ param ]: value } } /> );

		expect( getHref() ).toEqual(
			`https://wordpress.com${ JPC_PATH_BASE }?${ param }=${ value }&plan=${ PLAN_JETPACK_FREE }`
		);

		isJetpackCloud.mockRestore();
	} );

	it( 'should link to the Jetpack section in the site admin, when site in state', () => {
		const initialState = {
			ui: { selectedSiteId: siteId },
			sites: {
				items: {
					[ siteId ]: { options: { admin_url: adminUrl }, jetpack: true },
				},
			},
		};

		render( <JetpackFreeCardButton />, { initialState } );

		expect( getHref() ).toEqual( jetpackAdminUrl );
	} );

	it( 'should link to the connect page if the site is not a Jetpack site', () => {
		const initialState = {
			ui: { selectedSiteId: siteId },
			sites: {
				items: {
					[ siteId ]: { options: { admin_url: adminUrl }, jetpack: false },
				},
			},
		};

		render( <JetpackFreeCardButton />, { initialState } );

		expect( getHref() ).toEqual( JPC_PATH_BASE );
	} );

	it( 'should link to the Jetpack section in the site admin, when site in context', () => {
		render( <JetpackFreeCardButton urlQueryArgs={ { site: siteFragment } } /> );

		expect( getHref() ).toEqual( jetpackAdminUrl );
	} );

	it( 'should link to the Jetpack section in the site admin, when subsite in context', () => {
		const subSiteFragment = `${ siteFragment }::second::third`;
		const subSiteUrl = `${ siteUrl }/second/third`;

		render( <JetpackFreeCardButton urlQueryArgs={ { site: subSiteFragment } } /> );

		expect( getHref() ).toEqual( jetpackAdminUrl.replace( siteUrl, subSiteUrl ) );
	} );

	it( 'should link to the "admin_url" query arg value, when "admin_url" query arg is present', () => {
		const wpAdminQueryArg = `http://non-https-site.com/wp-admin/`;
		const jetpackAdminUrlFromQueryArg = `${ wpAdminQueryArg }admin.php?page=jetpack#/recommendations`;

		render( <JetpackFreeCardButton urlQueryArgs={ { admin_url: wpAdminQueryArg } } /> );

		expect( getHref() ).toEqual( jetpackAdminUrlFromQueryArg );
	} );

	it( 'should link to the connect page, if site in context is invalid', () => {
		render( <JetpackFreeCardButton urlQueryArgs={ { site: '%' } } /> );

		expect( getHref() ).toEqual( JPC_PATH_BASE );
	} );

	it( 'should link to the connect page, by default', () => {
		render( <JetpackFreeCardButton /> );

		expect( getHref() ).toEqual( JPC_PATH_BASE );
	} );

	it( 'should track clicks', () => {
		const spy = jest.spyOn( analytics, 'recordTracksEvent' );

		render( <JetpackFreeCardButton siteId={ siteId } /> );
		fireEvent.click( getLink() );

		expect( spy ).toHaveBeenCalledWith( 'calypso_product_jpfree_click', { site_id: siteId } );

		spy.mockRestore();
	} );

	it( 'should store Jetpack Free in session storage when clicked', () => {
		render( <JetpackFreeCardButton siteId={ siteId } /> );

		fireEvent.click( getLink() );

		expect( window.sessionStorage.getItem( SESSION_STORAGE_SELECTED_PLAN ) ).toEqual(
			PLAN_JETPACK_FREE
		);
	} );
} );
