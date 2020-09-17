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
import { Site } from '@automattic/data-stores';
const { Visibility } = Site;

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
	editor: {
		imageEditor: {},
	},
	ui: {},
};

function renderWithRedux( ui ) {
	const store = createStore( ( state ) => state, initialReduxState );
	return render( <Provider store={ store }>{ ui }</Provider> );
}

const props = {
	site: {
		plan: PLAN_FREE,
	},
	selectedSite: {},
	translate: ( x ) => x,
	onChangeField: () => ( z ) => z,
	eventTracker: () => ( z ) => z,
	trackEvent: () => ( z ) => z,
	updateFields: () => ( z ) => z,
	uniqueEventTracker: () => ( z ) => z,
	fields: {},
	moment,
};

describe( 'SiteSettingsFormGeneral ', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <SiteSettingsFormGeneral { ...props } /> );
		expect( comp.find( '.site-settings__site-options' ).length ).toBe( 1 );
	} );

	describe( 'UpsellNudge should get appropriate plan constant', () => {
		[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( ( plan ) => {
			test( `Business 1 year for (${ plan })`, () => {
				const comp = shallow(
					<SiteSettingsFormGeneral { ...props } siteIsJetpack={ false } site={ { plan } } />
				);
				expect( comp.find( 'UpsellNudge' ).length ).toBe( 1 );
				expect( comp.find( 'UpsellNudge' ).props().plan ).toBe( PLAN_BUSINESS );
			} );
		} );

		[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( ( plan ) => {
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
					blog_public: Visibility.PublicIndexed,
					wpcom_public_coming_soon: 0,
				},
				updateFields: jest.fn( ( fields ) => {
					testProps.fields = fields;
				} ),
			};
		} );

		test( `Should have 4 visibility options`, () => {
			const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 3 );
			expect( container.querySelectorAll( '[name="blog_coming_soon_mode"]' ).length ).toBe( 1 );
		} );

		/*
			V2 Cover all the states

			Possible States:

			Public
			Public + Noindex
			Public + Noindex + Coming Soon (v2)
			Private
			Private + Coming Soon (v1)

			Possible Transitions

			Public 								> Add Noindex				= Public + Noindex
			Public 								> Set Private				= Private
			Public 								> Add Coming Soon (v2)		= Public + Noindex + Coming Soon (v2)
			Public + Noindex					> Remove Noindex			= Public
			Public + Noindex					> Set Private				= Private
			Public + Noindex					> Add Coming soon (v2)		= Public + Noindex + Coming Soon (v2)
			Public + Noindex + Coming Soon (v2) > Remove Coming Soon (v2)	= Public
			Public + Noindex + Coming Soon (v2) > Remove Noindex			= Public
			Public + Noindex + Coming Soon (v2) > Set Private				= Private
			Private								> Set Public				= Public
			Private								> Add Noindex				= Public + Noindex
			Private								> Coming Soon (v2)			= Public + Noindex + Coming Soon (v2)
			Private + Coming Soon (v1)			> Public					= Public + Noindex + Coming Soon (v2) - scratch that just: Public
			Private + Coming Soon (v1)			> Remove Coming Soon (v1)	= Private - scratch that just: Public
		*/
		[
			{
				testName: 'Public > Add Noindex = Public + Noindex',
				initialProps: {
					blog_public: Visibility.Public,
					wpcom_public_coming_soon: 0,
				},
				labelToClick: 'Discourage search engines from indexing this site', // Noindex
				expectedUpdates: {
					blog_public: Visibility.PublicNotIndexed,
					wpcom_public_coming_soon: 0,
				},
			},
		].forEach( ( { testName, initialProps, labelToClick, expectedUpdates } ) => {
			test( `"${ testName }`, () => {
				testProps.fields.blog_public = initialProps.blog_public;
				testProps.fields.wpcom_public_coming_soon = initialProps.wpcom_public_coming_soon;

				const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

				const radioButton = getByLabelText( labelToClick, { exact: false } );
				expect( radioButton ).not.toBeChecked();
				fireEvent.click( radioButton );
				expect( testProps.updateFields ).toBeCalledWith( expectedUpdates );
			} );
		} );

		// V1
		// [
		// 	[
		// 		'Coming soon',
		// 		Visibility.PublicIndexed,
		// 		{ blog_public: Visibility.Private, wpcom_public_coming_soon: 1 },
		// 	],
		// 	[
		// 		'Public',
		// 		Visibility.Private,
		// 		{ blog_public: Visibility.PublicIndexed, wpcom_public_coming_soon: 0 },
		// 	],
		// 	[
		// 		'Discourage search engines from indexing this site',
		// 		Visibility.Private,
		// 		{ blog_public: Visibility.PublicNotIndexed, wpcom_public_coming_soon: 0 },
		// 	],
		// 	[
		// 		'Private',
		// 		Visibility.PublicIndexed,
		// 		{ blog_public: Visibility.Private, wpcom_public_coming_soon: 0 },
		// 	],
		// ].forEach( ( [ text, blogPublic, updatedFields ] ) => {
		// 	test( `"${ text }" option should be selectable`, () => {
		// 		testProps.fields.blog_public = blogPublic;
		// 		const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral {...testProps} /> );

		// 		const radioButton = getByLabelText( text, { exact: false } );
		// 		expect( radioButton ).not.toBeChecked();
		// 		fireEvent.click( radioButton );
		// 		expect( testProps.updateFields ).toBeCalledWith( updatedFields );
		// 	} );
		// } );

		// V2 Update
		[
			[
				Visibility.PublicIndexed,
				'Coming soon',
				{ blog_public: Visibility.PublicNotIndexed, wpcom_public_coming_soon: 1 },
			],
			[
				Visibility.Private,
				'Public',
				{ blog_public: Visibility.PublicIndexed, wpcom_public_coming_soon: 0 },
			],
			[
				Visibility.Private,
				'Discourage search engines from indexing this site',
				{ blog_public: Visibility.PublicNotIndexed, wpcom_public_coming_soon: 0 },
			],
			[
				Visibility.PublicIndexed,
				'Private',
				{ blog_public: Visibility.Private, wpcom_public_coming_soon: 0 },
			],
		].forEach( ( [ initialBlogPublic, label, updatedFields ] ) => {
			test( `"${ label }" option should be selectable`, () => {
				testProps.fields.blog_public = initialBlogPublic;
				const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

				const radioButton = getByLabelText( label, { exact: false } );
				expect( radioButton ).not.toBeChecked();
				fireEvent.click( radioButton );
				expect( testProps.updateFields ).toBeCalledWith( updatedFields );
			} );
		} );

		test( `Selecting NoIndex should switch radio to Public`, () => {
			testProps.fields.blog_public = -1;
			const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

			const noIndexCheckBox = getByLabelText( 'Discourage search engines from indexing this site', {
				exact: false,
			} );
			expect( noIndexCheckBox ).not.toBeChecked();

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio ).not.toBeChecked();

			fireEvent.click( noIndexCheckBox );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: Visibility.PublicNotIndexed,
				wpcom_public_coming_soon: 0,
			} );
		} );

		test( `NoIndex checkbox should be possible to unselect`, () => {
			testProps.fields.blog_public = Visibility.PublicNotIndexed;
			const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

			const noIndexCheckBox = getByLabelText( 'Discourage search engines from indexing this site', {
				exact: false,
			} );
			expect( noIndexCheckBox ).toBeChecked();

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio ).toBeChecked();

			fireEvent.click( noIndexCheckBox );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: Visibility.PublicIndexed,
				wpcom_public_coming_soon: 0,
			} );
		} );
	} );
} );
