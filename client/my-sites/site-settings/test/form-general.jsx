/**
 * @jest-environment jsdom
 */

jest.mock(
	'calypso/blocks/upsell-nudge',
	() =>
		function UpsellNudge() {
			return <div />;
		}
);

import {
	PLAN_FREE,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_WPCOM_PRO,
} from '@automattic/calypso-products';
import { render, fireEvent } from '@testing-library/react';
import { shallow } from 'enzyme';
import '@testing-library/jest-dom/extend-expect';
import moment from 'moment';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { SiteSettingsFormGeneral } from '../form-general';

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
	timezones: {
		labels: {},
		byContinents: {},
	},
	ui: {},
};

function renderWithRedux( ui ) {
	const queryClient = new QueryClient();
	const store = createStore(
		( state ) => state,
		initialReduxState,
		applyMiddleware( thunkMiddleware )
	);

	return render(
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ ui }</Provider>
		</QueryClientProvider>
	);
}

const props = {
	site: {
		plan: { product_slug: PLAN_FREE },
		domain: 'example.wordpress.com',
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

describe( 'SiteSettingsFormGeneral', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <SiteSettingsFormGeneral { ...props } /> );
		expect( comp.find( '.site-settings__site-options' ).length ).toBe( 1 );
	} );

	describe( 'UpsellNudge should get appropriate plan constant', () => {
		[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( ( plan ) => {
			test( `Business 1 year for (${ plan })`, () => {
				const comp = shallow(
					<SiteSettingsFormGeneral
						{ ...props }
						siteIsJetpack={ false }
						site={ { plan: { product_slug: plan }, domain: 'example.wordpress.com' } }
					/>
				);
				expect( comp.find( 'UpsellNudge' ).length ).toBe( 1 );
				expect( comp.find( 'UpsellNudge' ).props().plan ).toBe( PLAN_WPCOM_PRO );
			} );
		} );

		[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( ( plan ) => {
			test( `Business 2 year for (${ plan })`, () => {
				const comp = shallow(
					<SiteSettingsFormGeneral
						{ ...props }
						siteIsJetpack={ false }
						site={ { plan: { product_slug: plan }, domain: 'example.wordpress.com' } }
					/>
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
				site: { plan: { product_slug: PLAN_PERSONAL }, domain: 'example.wordpress.com' },
				fields: {
					blog_public: 1,
					wpcom_coming_soon: 0,
				},
				withComingSoonOption: true,
				updateFields: jest.fn( ( fields ) => {
					testProps.fields = fields;
				} ),
			};
		} );

		test( `Should have 4 visibility options`, () => {
			const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 4 );
		} );

		test( `Selecting Hidden should switch radio to Public`, () => {
			testProps.fields.blog_public = -1;
			const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

			const hiddenCheckbox = getByLabelText( 'Discourage search engines from indexing this site', {
				exact: false,
			} );
			expect( hiddenCheckbox ).not.toBeChecked();

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio ).not.toBeChecked();

			fireEvent.click( hiddenCheckbox );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 0,
				wpcom_coming_soon: 0,
				wpcom_public_coming_soon: 0,
			} );
		} );

		test( `Hidden checkbox should be possible to unselect`, () => {
			testProps.fields.blog_public = 0;
			const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

			const hiddenCheckbox = getByLabelText( 'Discourage search engines from indexing this site', {
				exact: false,
			} );
			expect( hiddenCheckbox ).toBeChecked();

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio ).toBeChecked();

			fireEvent.click( hiddenCheckbox );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 1,
				wpcom_coming_soon: 0,
				wpcom_public_coming_soon: 0,
			} );
		} );

		describe( 'blog_public states', () => {
			[
				[
					'Coming soon',
					'Coming Soon',
					1,
					{ blog_public: 0, wpcom_coming_soon: 0, wpcom_public_coming_soon: 1 },
				],
				[
					'Public',
					'Public',
					-1,
					{ blog_public: 1, wpcom_coming_soon: 0, wpcom_public_coming_soon: 0 },
				],
				[
					'Hidden',
					'Discourage search engines from indexing this site',
					-1,
					{ blog_public: 0, wpcom_coming_soon: 0, wpcom_public_coming_soon: 0 },
				],
				[
					'Private',
					'Private',
					1,
					{ blog_public: -1, wpcom_coming_soon: 0, wpcom_public_coming_soon: 0 },
				],
			].forEach( ( [ name, text, initialBlogPublic, updatedFields ] ) => {
				test( `${ name } option should be selectable`, () => {
					testProps.fields.blog_public = initialBlogPublic;
					const { getByLabelText } = renderWithRedux(
						<SiteSettingsFormGeneral { ...testProps } />
					);

					const radioButton = getByLabelText( text, { exact: false } );
					expect( radioButton ).not.toBeChecked();
					fireEvent.click( radioButton );
					expect( testProps.updateFields ).toBeCalledWith( updatedFields );
				} );
			} );

			// We want to show the coming soon setting for existing coming soon v1 sites that have not migrated
			describe( 'support existing coming soon v1 sites that have not migrated', () => {
				test( 'Should check private option when site is private, but not in coming soon v1 and not private and unlaunched', () => {
					const newProps = {
						...testProps,
						fields: {
							blog_public: -1,
							wpcom_coming_soon: 0,
						},
					};

					const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...newProps } /> );
					const radioButtonComingSoon = getByLabelText( 'Coming soon', { exact: false } );
					expect( radioButtonComingSoon ).not.toBeChecked();

					// Check that we're not displaying the site as private
					const radioButtonPrivate = getByLabelText( 'Private', { exact: false } );
					expect( radioButtonPrivate ).toBeChecked();
				} );

				test( 'Coming soon option should be selected when a site still has coming soon v1 enabled', () => {
					const newProps = {
						...testProps,
						fields: {
							wpcom_coming_soon: 1,
						},
					};

					const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...newProps } /> );
					const radioButtonComingSoon = getByLabelText( 'Coming soon', { exact: false } );
					expect( radioButtonComingSoon ).toBeChecked();

					// Check that we're not displaying the site as private
					const radioButtonPrivate = getByLabelText( 'Private', { exact: false } );
					expect( radioButtonPrivate ).not.toBeChecked();
				} );

				test( 'Should check private option when site is in coming soon v1 mode but the etk plugin is disabled on atomic', () => {
					const newProps = {
						...testProps,
						fields: {
							wpcom_coming_soon: 1,
						},
						isAtomicAndEditingToolkitDeactivated: true,
					};

					const { getByLabelText, container } = renderWithRedux(
						<SiteSettingsFormGeneral { ...newProps } />
					);
					expect(
						container.querySelector( '.site-settings__visibility-label.is-coming-soon' )
					).toBe( null );

					// Check that we're not displaying the site as private
					const radioButtonPrivate = getByLabelText( 'Private', { exact: false } );
					expect( radioButtonPrivate ).toBeChecked();
				} );
			} );
		} );

		describe( 'unlaunched site', () => {
			it( 'Should not show the site settings UI', () => {
				testProps = {
					...testProps,
					isUnlaunchedSite: true,
					siteDomains: [ 'example.wordpress.com' ],
				};

				const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

				expect( container.querySelectorAll( '#site-privacy-settings' ) ).toHaveLength( 0 );
			} );
		} );

		describe( 'Coming soon plugin availability', () => {
			test( 'Should hide Coming Soon form element when the site is not atomic or the editing toolkit plugin is not disabled', () => {
				const newProps = {
					...props,
					isAtomicAndEditingToolkitDeactivated: false,
				};

				const comp = shallow( <SiteSettingsFormGeneral { ...newProps } /> );
				expect( comp.find( '.site-settings__visibility-label.is-coming-soon' ).length ).toBe( 1 );
			} );

			test( 'Should hide Coming Soon form element when the site is atomic and the editing toolkit plugin is disabled', () => {
				const newProps = {
					...props,
					isAtomicAndEditingToolkitDeactivated: true,
				};
				const comp = shallow( <SiteSettingsFormGeneral { ...newProps } /> );
				expect( comp.find( '.site-settings__visibility-label.is-coming-soon' ).length ).toBe( 0 );
			} );

			test( 'Should check public not indexed when coming soon plugin is not available', () => {
				const newProps = {
					...props,
					fields: {
						wpcom_public_coming_soon: 1,
						blog_public: 0,
					},
					isAtomicAndEditingToolkitDeactivated: true,
				};
				const { getByLabelText, container } = renderWithRedux(
					<SiteSettingsFormGeneral { ...newProps } />
				);
				expect( container.querySelector( '.site-settings__visibility-label.is-coming-soon' ) ).toBe(
					null
				);

				const radioButtonPublic = getByLabelText( 'Public', { exact: false } );
				expect( radioButtonPublic ).toBeChecked();

				const hiddenCheckbox = getByLabelText(
					'Discourage search engines from indexing this site',
					{
						exact: false,
					}
				);
				expect( hiddenCheckbox ).toBeChecked();
			} );
		} );

		describe( 'P2 Hub', () => {
			it( 'Should not show the privacy settings UI', () => {
				testProps = {
					...testProps,
					isP2HubSite: true,
				};

				const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

				expect( container.querySelectorAll( '#site-privacy-settings' ) ).toHaveLength( 0 );
			} );
		} );
	} );
} );
