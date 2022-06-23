/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { siteColumns } from '../../utils';
import SiteTable from '../index';
import type { SiteData } from '../../types';

describe( '<SiteTable>', () => {
	const scanThreats = 4;
	const blogId = 1234;
	const pluginUpdates = [ 'plugin-1', 'plugin-2', 'plugin-3' ];
	const siteUrl = 'test.jurassic.ninja';
	const items: Array< SiteData > = [
		{
			site: {
				value: {
					blog_id: blogId,
					url: siteUrl,
					url_with_scheme: `https://${ siteUrl }/`,
				},
				error: false,
				type: 'site',
				status: '',
			},
			backup: {
				type: 'backup',
				value: translate( 'Failed' ),
				status: 'failed',
			},
			monitor: {
				error: false,
				status: 'failed',
				type: 'monitor',
				value: translate( 'Site Down' ),
			},
			scan: {
				threats: 4,
				type: 'scan',
				status: 'failed',
				value: translate(
					'%(threats)d Threat',
					'%(threats)d Threats', // plural version of the string
					{
						count: scanThreats,
						args: {
							threats: scanThreats,
						},
					}
				),
			},
			plugin: {
				updates: pluginUpdates.length,
				type: 'plugin',
				value: `${ pluginUpdates.length } ${ translate( 'Available' ) }`,
				status: 'warning',
			},
		},
	];
	const props = {
		items,
		isFetching: false,
		columns: siteColumns,
	};
	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );

	const { getByTestId } = render(
		<Provider store={ store }>
			<SiteTable { ...props } />
		</Provider>
	);

	test( 'should render correctly and have href and status for each row', () => {
		const backupEle = getByTestId( `row-${ blogId }-backup` );
		expect( backupEle.getAttribute( 'href' ) ).toEqual( `/backup/${ siteUrl }` );
		expect( backupEle.getElementsByClassName( 'sites-overview__badge' )[ 0 ].textContent ).toEqual(
			'Failed'
		);

		const scanEle = getByTestId( `row-${ blogId }-scan` );
		expect( scanEle.getAttribute( 'href' ) ).toEqual( `/scan/${ siteUrl }` );
		expect( scanEle.getElementsByClassName( 'sites-overview__badge' )[ 0 ].textContent ).toEqual(
			`${ scanThreats } Threats`
		);

		const monitorEle = getByTestId( `row-${ blogId }-monitor` );
		expect( monitorEle.getAttribute( 'href' ) ).toEqual(
			`https://jptools.wordpress.com/debug/?url=${ siteUrl }`
		);
		expect( monitorEle.getElementsByClassName( 'sites-overview__badge' )[ 0 ].textContent ).toEqual(
			'Site Down'
		);

		const pluginEle = getByTestId( `row-${ blogId }-plugin` );
		expect( pluginEle.getAttribute( 'href' ) ).toEqual(
			`https://wordpress.com/plugins/updates/${ siteUrl }`
		);
		expect( pluginEle.getElementsByClassName( 'sites-overview__badge' )[ 0 ].textContent ).toEqual(
			`${ pluginUpdates.length } Available`
		);
	} );
} );
