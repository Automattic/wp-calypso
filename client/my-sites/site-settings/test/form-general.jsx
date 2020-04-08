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
	'blocks/upsell-nudge',
	() =>
		function UpsellNudge() {
			return <div />;
		}
);

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
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

const initialReduxState = {
	siteSettings: {},
	sites: {
		items: [],
	},
	media: {
		queries: {},
	},
	currentUser: {
		capabilities: {},
	},
	ui: {
		editor: {
			imageEditor: {},
		},
	},
};

function renderWithRedux( ui ) {
	const store = createStore( state => state, initialReduxState );
	return render( <Provider store={ store }>{ ui }</Provider> );
}

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

	describe( 'UpsellNudge should get appropriate plan constant', () => {
		[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( plan => {
			test( `Business 1 year for (${ plan })`, () => {
				const comp = shallow(
					<SiteSettingsFormGeneral { ...props } siteIsJetpack={ false } site={ { plan } } />
				);
				expect( comp.find( 'UpsellNudge' ).length ).toBe( 1 );
				expect( comp.find( 'UpsellNudge' ).props().plan ).toBe( PLAN_BUSINESS );
			} );
		} );

		[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( plan => {
			test( `Business 2 year for (${ plan })`, () => {
				const comp = shallow(
					<SiteSettingsFormGeneral { ...props } siteIsJetpack={ false } site={ { plan } } />
				);
				expect( comp.find( 'UpsellNudge' ).length ).toBe( 1 );
				expect( comp.find( 'UpsellNudge' ).props().plan ).toBe( PLAN_BUSINESS );
			} );
		} );

		test( 'No UpsellNudge for jetpack plans', () => {
			const comp = shallow( <SiteSettingsFormGeneral { ...props } siteIsJetpack={ true } /> );
			expect( comp.find( 'UpsellNudge' ).length ).toBe( 0 );
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
				updateFields: jest.fn( fields => {
					testProps.fields = fields;
				} ),
			};
		} );

		test( `Should have 4 visibility options`, () => {
			const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );
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
				testProps.fields.blog_public = initialBlogPublic;
				const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

				const radioButton = getByLabelText( text );
				expect( radioButton ).not.toBeChecked();
				fireEvent.click( radioButton );
				expect( testProps.updateFields ).toBeCalledWith( updatedFields );
			} );
		} );

		test( `Selecting Hidden should switch radio to Public`, () => {
			testProps.fields.blog_public = -1;
			const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

			const hiddenCheckbox = getByLabelText( 'Do not allow search engines to index my site' );
			expect( hiddenCheckbox ).not.toBeChecked();

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio ).not.toBeChecked();

			fireEvent.click( hiddenCheckbox );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 0,
				wpcom_coming_soon: 0,
			} );
		} );

		test( `Hidden checkbox should be possible to unselect`, () => {
			testProps.fields.blog_public = 0;
			const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

			const hiddenCheckbox = getByLabelText( 'Do not allow search engines to index my site' );
			expect( hiddenCheckbox ).toBeChecked();

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio ).toBeChecked();

			fireEvent.click( hiddenCheckbox );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 1,
				wpcom_coming_soon: 0,
			} );
		} );
	} );
} );
