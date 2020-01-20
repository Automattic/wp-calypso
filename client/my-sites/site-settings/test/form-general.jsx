/**
 * @jest-environment jsdom
 */

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );

jest.mock( 'store', () => ( {
	get: () => {},
	User: () => {},
} ) );
jest.mock(
	'components/banner',
	() =>
		function Banner() {
			return <div />;
		}
);
jest.mock(
	'components/data/query-site-settings',
	() =>
		function QuerySiteSettings() {
			return <div />;
		}
);
jest.mock(
	'components/language-picker',
	() =>
		function LanguagePicker() {
			return <div />;
		}
);
jest.mock(
	'components/timezone',
	() =>
		function Timezone() {
			return <div />;
		}
);
jest.mock(
	'../site-icon-setting',
	() =>
		function SiteIconSetting() {
			return <div />;
		}
);

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import {
	PLAN_FREE,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
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
	onChangeField: () => z => z,
	eventTracker: () => z => z,
	trackEvent: () => z => z,
	updateFields: () => z => z,
	uniqueEventTracker: () => z => z,
	fields: {},
	moment,
};

describe( 'SiteSettingsFormGeneral ', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <SiteSettingsFormGeneral { ...props } /> );
		expect( comp.find( '.site-settings__site-options' ).length ).toBe( 1 );
	} );

	describe( 'Upsell Banner should get appropriate plan constant', () => {
		[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( plan => {
			test( `Business 1 year for (${ plan })`, () => {
				const comp = shallow(
					<SiteSettingsFormGeneral { ...props } siteIsJetpack={ false } site={ { plan } } />
				);
				expect( comp.find( 'Banner' ).length ).toBe( 1 );
				expect( comp.find( 'Banner' ).props().plan ).toBe( PLAN_BUSINESS );
			} );
		} );

		[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( plan => {
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

	describe( 'Privacy picker - simple sites', () => {
		let testProps;

		beforeEach( () => {
			testProps = {
				...props,
				siteIsJetpack: false,
				site: { plan: PLAN_PERSONAL },
				fields: {
					blog_public: 1,
					wpcom_coming_soon: 0,
				},
				withComingSoonOption: true,
				updateFields: fields => {
					testProps.fields = fields;
				},
			};
		} );

		test( `Should have 4 visibility options`, () => {
			const { container } = render( <SiteSettingsFormGeneral { ...testProps } /> );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 4 );
		} );

		[
			[ 'Coming soon', 'Coming Soon', 1, { blog_public: -1, wpcom_coming_soon: 1 } ],
			[ 'Public', 'Public', -1, { blog_public: 1, wpcom_coming_soon: 0 } ],
			[
				'Hidden',
				'Do not allow search engines to index my site',
				-1,
				{ blog_public: 0, wpcom_coming_soon: 0 },
			],
			[ 'Private', 'Private', 1, { blog_public: -1, wpcom_coming_soon: 0 } ],
		].forEach( ( [ name, text, initialBlogPublic, updatedFields ] ) => {
			test( `${ name } option should be selectable`, () => {
				testProps.updateFields = jest.fn();
				testProps.fields.blog_public = initialBlogPublic;
				const { getByLabelText } = render( <SiteSettingsFormGeneral { ...testProps } /> );

				const radioButton = getByLabelText( text );
				expect( radioButton.checked ).toBe( false );
				fireEvent.click( radioButton );
				expect( testProps.updateFields ).toBeCalledWith( updatedFields );
			} );
		} );

		test( `Selecting Hidden should switch radio to Public`, () => {
			testProps.updateFields = jest.fn();
			testProps.fields.blog_public = -1;
			const { getByLabelText } = render( <SiteSettingsFormGeneral { ...testProps } /> );

			const hiddenCheckbox = getByLabelText( 'Do not allow search engines to index my site' );
			expect( hiddenCheckbox.checked ).toBe( false );

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio.checked ).toBe( false );

			fireEvent.click( hiddenCheckbox );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 0,
				wpcom_coming_soon: 0,
			} );
		} );

		test( `Hidden checkbox should be possible to unselect`, () => {
			testProps.fields.blog_public = -1;
			const { getByLabelText, rerender } = render( <SiteSettingsFormGeneral { ...testProps } /> );

			const hiddenCheckbox = getByLabelText( 'Do not allow search engines to index my site' );
			expect( hiddenCheckbox.checked ).toBe( false );

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio.checked ).toBe( false );

			fireEvent.click( hiddenCheckbox );
			rerender( <SiteSettingsFormGeneral { ...testProps } /> );
			fireEvent.click( hiddenCheckbox );
			rerender( <SiteSettingsFormGeneral { ...testProps } /> );

			expect( hiddenCheckbox.checked ).toBe( false );
			expect( publicRadio.checked ).toBe( true );
		} );
	} );
} );
