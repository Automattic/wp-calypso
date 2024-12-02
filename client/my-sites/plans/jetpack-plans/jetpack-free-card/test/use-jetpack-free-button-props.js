/**
 * @jest-environment jsdom
 */
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn(),
	useSelector: jest.fn( ( fn ) => fn() ),
} ) );

jest.mock( 'calypso/jetpack-connect/persistence-utils', () => ( {
	...jest.requireActual( 'calypso/jetpack-connect/persistence-utils' ),
	storePlan: jest.fn(),
} ) );
jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );
jest.mock( 'calypso/lib/jetpack/use-track-callback' );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	...jest.requireActual( 'calypso/state/ui/selectors' ),
	getSelectedSite: jest.fn(),
} ) );

import { PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import { JPC_PATH_BASE } from 'calypso/jetpack-connect/constants';
import { storePlan } from 'calypso/jetpack-connect/persistence-utils';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import useJetpackFreeButtonProps from '../use-jetpack-free-button-props';

const siteId = 1;
const siteFragment = 'bored-sheep.jurassic.ninja';
const siteUrl = `https://${ siteFragment }`;
const adminUrl = `${ siteUrl }/wp-admin/`;
const jetpackAdminUrl = `${ adminUrl }admin.php?page=jetpack#/recommendations`;

describe( 'useJetpackFreeButtonProps', () => {
	beforeEach( () => {
		isJetpackCloud.mockRestore();
		getSelectedSite.mockRestore();
		useTrackCallback.mockRestore();
	} );

	it( 'should link to the Jetpack-Free Welcome UI page, for Jetpack Cloud with no site in context', () => {
		const queryParamKey = 'a';
		const queryParamValue = 1;

		isJetpackCloud.mockReturnValue( true );
		const { result } = renderHook( () =>
			useJetpackFreeButtonProps( undefined, { [ queryParamKey ]: queryParamValue } )
		);

		expect( result.current.href ).toEqual( `/pricing/jetpack-free/welcome` );
	} );

	it( 'should link back to redirect_to, for Jetpack Cloud while unlinked and coming from My Jetpack', () => {
		isJetpackCloud.mockReturnValue( true );
		const { result } = renderHook( () =>
			useJetpackFreeButtonProps( undefined, {
				unlinked: '1',
				source: 'my-jetpack',
				redirect_to: adminUrl,
			} )
		);

		expect( result.current.href ).toEqual( adminUrl );
	} );

	it( 'should link to the Jetpack section in the site admin, when site in state', () => {
		getSelectedSite.mockReturnValue( {
			options: { admin_url: adminUrl },
			jetpack: true,
		} );

		const { result } = renderHook( () => useJetpackFreeButtonProps() );

		expect( result.current.href ).toEqual( jetpackAdminUrl );
	} );

	it( 'should link to the connect page if the site is not a Jetpack site', () => {
		getSelectedSite.mockReturnValue( {
			options: { admin_url: adminUrl },
			jetpack: false,
		} );

		const { result } = renderHook( () => useJetpackFreeButtonProps() );

		expect( result.current.href ).toEqual( JPC_PATH_BASE );
	} );

	it( 'should link to the Jetpack section in the site admin, when site in context', () => {
		const { result } = renderHook( () =>
			useJetpackFreeButtonProps( undefined, { site: siteFragment } )
		);

		expect( result.current.href ).toEqual( jetpackAdminUrl );
	} );

	it( 'should link to the Jetpack section in the site admin, when subsite in context', () => {
		const subSiteFragment = `${ siteFragment }::second::third`;
		const subSiteUrl = `${ siteUrl }/second/third`;

		const { result } = renderHook( () =>
			useJetpackFreeButtonProps( undefined, { site: subSiteFragment } )
		);

		expect( result.current.href ).toEqual( jetpackAdminUrl.replace( siteUrl, subSiteUrl ) );
	} );

	it( 'should link to the "admin_url" query arg value, when "admin_url" query arg is present', () => {
		const wpAdminQueryArg = `http://non-https-site.com/wp-admin/`;
		const jetpackAdminUrlFromQueryArg = `${ wpAdminQueryArg }admin.php?page=jetpack#/recommendations`;

		const { result } = renderHook( () =>
			useJetpackFreeButtonProps( undefined, { admin_url: wpAdminQueryArg } )
		);

		expect( result.current.href ).toEqual( jetpackAdminUrlFromQueryArg );
	} );

	it( 'should link to the connect page, if site in context is invalid', () => {
		const { result } = renderHook( () => useJetpackFreeButtonProps( undefined, { site: '%' } ) );

		expect( result.current.href ).toEqual( JPC_PATH_BASE );
	} );

	it( 'should link to the connect page, by default', () => {
		const { result } = renderHook( useJetpackFreeButtonProps );

		expect( result.current.href ).toEqual( JPC_PATH_BASE );
	} );

	it( 'should send a tracking event when onClick is called', () => {
		const trackingSpy = jest.fn();
		useTrackCallback.mockReturnValue( trackingSpy );

		const { result } = renderHook( () => useJetpackFreeButtonProps( siteId ) );

		expect( useTrackCallback ).toHaveBeenCalledWith( undefined, 'calypso_product_jpfree_click', {
			site_id: siteId,
		} );

		result.current.onClick();

		expect( trackingSpy ).toHaveBeenCalled();
	} );

	it( 'should store Jetpack Free in session storage when onClick is called', () => {
		useTrackCallback.mockReturnValue( jest.fn() );

		const { result } = renderHook( () => useJetpackFreeButtonProps( siteId ) );
		result.current.onClick();

		expect( storePlan ).toHaveBeenCalledWith( PLAN_JETPACK_FREE );
	} );
} );
