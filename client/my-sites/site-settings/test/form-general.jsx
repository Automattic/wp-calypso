/** @format */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'store', () => ( {
	get: () => {},
	User: () => {},
} ) );
jest.mock( 'components/language-picker', () => 'LanguagePicker' );
jest.mock( 'components/popover', () => 'Popover' );
jest.mock( 'components/info-popover', () => 'InfoPopover' );
jest.mock( 'components/banner', () => 'Banner' );
jest.mock( 'components/data/query-site-settings', () => 'QuerySiteSettings' );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
} from 'lib/plans/constants';

/**
 * Internal dependencies
 */
import { SiteSettingsFormGeneral } from '../form-general';

import moment from 'moment';

moment.tz = {
	guess: () => moment(),
};

const props = {
	site: {
		plan: PLAN_FREE,
	},
	selectedSite: {},
	translate: x => x,
	onChangeField: x => x,
	eventTracker: x => x,
	uniqueEventTracker: x => x,
	fields: {},
	moment,
};

describe( 'SiteSettingsFormGeneral ', () => {
	afterAll( () => {
		global.window = {};
	} );

	afterAll( () => {
		delete global.window;
	} );

	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <SiteSettingsFormGeneral { ...props } /> );
		expect( comp.find( '.site-settings__site-options' ).length ).toBe( 1 );
	} );

	describe( 'Upsell Banner should get appropriate plan constant', () => {
		[ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( plan => {
			test( `Business 1 year for (${ plan })`, () => {
				const comp = shallow(
					<SiteSettingsFormGeneral { ...props } siteIsJetpack={ false } site={ { plan } } />
				);
				expect( comp.find( 'Banner' ).length ).toBe( 1 );
				expect( comp.find( 'Banner' ).props().plan ).toBe( PLAN_BUSINESS );
			} );
		} );

		[ PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( plan => {
			test( `Business 2 year for (${ plan })`, () => {
				const comp = shallow(
					<SiteSettingsFormGeneral { ...props } siteIsJetpack={ false } site={ { plan } } />
				);
				expect( comp.find( 'Banner' ).length ).toBe( 1 );
				expect( comp.find( 'Banner' ).props().plan ).toBe( PLAN_BUSINESS );
			} );
		} );

		test( 'No banner for jetpack plans', () => {
			const comp = shallow( <SiteSettingsFormGeneral { ...props } siteIsJetpack={ true } /> );
			expect( comp.find( 'Banner' ).length ).toBe( 0 );
		} );
	} );
} );
