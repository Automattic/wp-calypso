/**
 * @jest-environment jsdom
 */

jest.mock(
	'calypso/blocks/upsell-nudge',
	() =>
		function UpsellNudge( { plan } ) {
			return <div data-testid="upsell-nudge">{ plan }</div>;
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
	PLAN_JETPACK_FREE,
} from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import editorReducer from 'calypso/state/editor/reducer';
import jetpackReducer from 'calypso/state/jetpack/reducer';
import mediaReducer from 'calypso/state/media/reducer';
import siteSettingsReducer from 'calypso/state/site-settings/reducer';
import timezonesReducer from 'calypso/state/timezones/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SiteSettingsFormGeneral } from '../form-general';

moment.tz = {
	guess: () => moment(),
};

const initialState = {
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
	jetpack: {},
};

function renderWithRedux( ui ) {
	return renderWithProvider( ui, {
		initialState,
		reducers: {
			editor: editorReducer,
			media: mediaReducer,
			siteSettings: siteSettingsReducer,
			timezones: timezonesReducer,
			ui: uiReducer,
			jetpack: jetpackReducer,
		},
	} );
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
		const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...props } /> );
		expect( container.getElementsByClassName( 'site-settings__site-options' ) ).toHaveLength( 1 );
	} );

	describe( 'UpsellNudge should get appropriate plan constant', () => {
		[ PLAN_FREE, PLAN_BLOGGER, PLAN_PERSONAL, PLAN_PREMIUM ].forEach( ( plan ) => {
			test( `Business 1 year for (${ plan })`, () => {
				renderWithRedux(
					<SiteSettingsFormGeneral
						{ ...props }
						siteIsJetpack={ false }
						site={ { plan: { product_slug: plan }, domain: 'example.wordpress.com' } }
					/>
				);
				expect( screen.queryByTestId( 'upsell-nudge' ) ).toBeVisible();
				expect( screen.queryByTestId( 'upsell-nudge' ).textContent ).toBe( PLAN_BUSINESS );
			} );
		} );

		[ PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_2_YEARS, PLAN_PREMIUM_2_YEARS ].forEach( ( plan ) => {
			test( `Business 2 year for (${ plan })`, () => {
				renderWithRedux(
					<SiteSettingsFormGeneral
						{ ...props }
						siteIsJetpack={ false }
						site={ { plan: { product_slug: plan }, domain: 'example.wordpress.com' } }
					/>
				);
				expect( screen.queryByTestId( 'upsell-nudge' ) ).toBeVisible();
				expect( screen.queryByTestId( 'upsell-nudge' ).textContent ).toBe( PLAN_BUSINESS );
			} );
		} );

		test( 'No UpsellNudge for jetpack plans', () => {
			renderWithRedux( <SiteSettingsFormGeneral { ...props } siteIsJetpack={ true } /> );
			expect( screen.queryByTestId( 'upsell-nudge' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Privacy Settings', () => {
		let testProps;
		let atomicBusinessProps;
		let atomicStagingProps;
		let jetpackProps;
		let simplePersonalProps;

		beforeAll( () => {
			atomicBusinessProps = {
				...props,
				siteId: 1234,
				site: {
					ID: 1234,
					plan: { product_slug: PLAN_BUSINESS },
					domain: 'example.wpcomstaging.com',
				},
				siteDomains: [],
				siteIsAtomic: true,
				siteIsJetpack: true,
				siteIsP2Hub: false,
				isAtomicAndEditingToolkitDeactivated: false,
				isP2HubSite: false,
				isWPForTeamsSite: false,
				isWpcomStagingSite: false,
				updateFields: jest.fn( ( fields ) => {
					testProps.fields = fields;
				} ),
			};
			atomicStagingProps = {
				...props,
				siteId: 1234,
				site: {
					ID: 1234,
					plan: { product_slug: PLAN_FREE },
					domain: 'staging-example.wpcomstaging.com',
				},
				siteDomains: [],
				siteIsAtomic: true,
				siteIsJetpack: true,
				siteIsP2Hub: false,
				isAtomicAndEditingToolkitDeactivated: false,
				isP2HubSite: false,
				isWPForTeamsSite: false,
				isWpcomStagingSite: true,
				updateFields: jest.fn( ( fields ) => {
					testProps.fields = fields;
				} ),
			};
			jetpackProps = {
				...props,
				siteId: 1234,
				site: {
					ID: 1234,
					plan: { product_slug: PLAN_JETPACK_FREE },
					domain: 'equivalent-lungfish.jurassic.ninja',
				},
				siteDomains: [],
				siteIsAtomic: false,
				siteIsJetpack: true,
				siteIsP2Hub: false,
				isAtomicAndEditingToolkitDeactivated: false,
				isP2HubSite: false,
				isWPForTeamsSite: false,
				isWpcomStagingSite: false,
				updateFields: jest.fn( ( fields ) => {
					testProps.fields = fields;
				} ),
			};
			simplePersonalProps = {
				...props,
				siteId: 1234,
				site: { ID: 1234, plan: { product_slug: PLAN_PERSONAL }, domain: 'example.wordpress.com' },
				siteDomains: [],
				siteIsAtomic: false,
				siteIsJetpack: false,
				siteIsP2Hub: false,
				isAtomicAndEditingToolkitDeactivated: false,
				isP2HubSite: false,
				isWPForTeamsSite: false,
				isWpcomStagingSite: false,
				updateFields: jest.fn( ( fields ) => {
					testProps.fields = fields;
				} ),
			};
		} );

		test( 'Simple Site, Personal Plan, Unlaunched', () => {
			testProps = {
				...simplePersonalProps,
				isComingSoon: true,
				isUnlaunchedSite: true,
				fields: {
					wpcom_public_coming_soon: 1,
					wpcom_coming_soon: 0,
					blog_public: 0,
				},
			};
			const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 1 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 0 );
		} );

		test( 'Simple Site, Personal Plan, Private -> click Public -> click Discourage Search Engines', async () => {
			testProps = {
				...simplePersonalProps,
				isComingSoon: false,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 0,
					wpcom_coming_soon: 0,
					blog_public: '-1',
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 4 );

			const publicRadio = getByLabelText( 'Public' );
			const discourageRadio = getByLabelText( 'Discourage search engines from indexing this site', {
				exact: false,
			} );

			expect( getByLabelText( 'Coming Soon' ) ).not.toBeChecked();
			expect( publicRadio ).not.toBeChecked();
			expect( discourageRadio ).not.toBeChecked();
			expect( getByLabelText( 'Private' ) ).toBeChecked();

			await userEvent.click( publicRadio );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 1,
				wpcom_coming_soon: 0,
				wpcom_public_coming_soon: 0,
			} );

			await userEvent.click( discourageRadio );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 0,
				wpcom_coming_soon: 0,
				wpcom_public_coming_soon: 0,
			} );
		} );

		test( 'Simple Site, Personal Plan, Coming Soon', () => {
			testProps = {
				...simplePersonalProps,
				isComingSoon: true,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 1,
					wpcom_coming_soon: 0,
					blog_public: 0,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 4 );
			expect( getByLabelText( 'Coming Soon' ) ).toBeChecked();
			expect( getByLabelText( 'Public' ) ).not.toBeChecked();
			expect(
				getByLabelText( 'Discourage search engines from indexing this site', { exact: false } )
			).not.toBeChecked();
			expect( getByLabelText( 'Private' ) ).not.toBeChecked();
		} );

		test( 'Simple Site, Personal Plan, Public', () => {
			testProps = {
				...simplePersonalProps,
				isComingSoon: false,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 0,
					wpcom_coming_soon: 0,
					blog_public: 1,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 4 );
			expect( getByLabelText( 'Coming Soon' ) ).not.toBeChecked();
			expect( getByLabelText( 'Public' ) ).toBeChecked();
			expect(
				getByLabelText( 'Discourage search engines from indexing this site', { exact: false } )
			).not.toBeChecked();
			expect( getByLabelText( 'Private' ) ).not.toBeChecked();
		} );

		test( 'Jetpack Site, Public -> click Discourage Search Engines', async () => {
			testProps = {
				...jetpackProps,
				isComingSoon: false,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 0,
					wpcom_coming_soon: 0,
					blog_public: 1,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 1 );

			const discourageRadio = getByLabelText( 'Discourage search engines from indexing this site', {
				exact: false,
			} );
			expect( discourageRadio ).not.toBeChecked();

			await userEvent.click( discourageRadio );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 0,
				wpcom_coming_soon: 0,
				wpcom_public_coming_soon: 0,
			} );
		} );

		test( 'Atomic Site, Business Plan, Unlaunched', () => {
			testProps = {
				...atomicBusinessProps,
				isComingSoon: true,
				isUnlaunchedSite: true,
				fields: {
					wpcom_public_coming_soon: 1,
					wpcom_coming_soon: 0,
					blog_public: 0,
				},
			};
			const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 1 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 0 );
		} );

		test( 'Atomic Site, Business Plan, Search Engines Discouraged', () => {
			testProps = {
				...atomicBusinessProps,
				isComingSoon: false,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 0,
					wpcom_coming_soon: 0,
					blog_public: 0,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 4 );
			expect( getByLabelText( 'Coming Soon' ) ).not.toBeChecked();
			expect( getByLabelText( 'Public' ) ).toBeChecked();
			expect(
				getByLabelText( 'Discourage search engines from indexing this site', { exact: false } )
			).toBeChecked();
			expect( getByLabelText( 'Private' ) ).not.toBeChecked();
		} );

		test( 'Atomic Site, Business Plan, Public', () => {
			testProps = {
				...atomicBusinessProps,
				isComingSoon: false,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 0,
					wpcom_coming_soon: 0,
					blog_public: 1,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 4 );
			expect( getByLabelText( 'Coming Soon' ) ).not.toBeChecked();
			expect( getByLabelText( 'Public' ) ).toBeChecked();
			expect(
				getByLabelText( 'Discourage search engines from indexing this site', { exact: false } )
			).not.toBeChecked();
			expect( getByLabelText( 'Private' ) ).not.toBeChecked();
		} );

		test( 'Atomic Staging Site, Unlaunched', () => {
			testProps = {
				...atomicStagingProps,
				isComingSoon: true,
				isUnlaunchedSite: true,
				fields: {
					wpcom_public_coming_soon: 1,
					wpcom_coming_soon: 0,
					blog_public: 0,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			// Staging sites shouldn't ever show the 'Launch site' container.
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 3 );
			expect( getByLabelText( 'Coming Soon' ) ).toBeChecked();
		} );

		test( 'Atomic Staging Site, Coming Soon -> click Public', async () => {
			testProps = {
				...atomicStagingProps,
				isComingSoon: true,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 1,
					wpcom_coming_soon: 0,
					blog_public: 0,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 3 );

			const publicRadio = getByLabelText( 'Public' );

			expect( getByLabelText( 'Coming Soon' ) ).toBeChecked();
			expect( publicRadio ).not.toBeChecked();
			expect( getByLabelText( 'Private' ) ).not.toBeChecked();

			await userEvent.click( publicRadio );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 0,
				wpcom_coming_soon: 0,
				wpcom_public_coming_soon: 0,
			} );
		} );

		test( 'Atomic Staging Site, Public', () => {
			testProps = {
				...atomicStagingProps,
				isComingSoon: false,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 0,
					wpcom_coming_soon: 0,
					blog_public: 1,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 3 );
			expect( getByLabelText( 'Coming Soon' ) ).not.toBeChecked();
			expect( getByLabelText( 'Public' ) ).toBeChecked();
			expect( getByLabelText( 'Private' ) ).not.toBeChecked();
		} );

		test( 'Atomic Staging Site, Search Engines Discouraged', () => {
			testProps = {
				...atomicStagingProps,
				isComingSoon: false,
				isUnlaunchedSite: false,
				fields: {
					wpcom_public_coming_soon: 0,
					wpcom_coming_soon: 0,
					blog_public: 0,
				},
			};
			const { container, getByLabelText } = renderWithRedux(
				<SiteSettingsFormGeneral { ...testProps } />
			);
			expect(
				container.querySelectorAll( '.site-settings__general-settings-launch-site' ).length
			).toBe( 0 );
			expect( container.querySelectorAll( '[name="blog_public"]' ).length ).toBe( 3 );
			expect( getByLabelText( 'Coming Soon' ) ).not.toBeChecked();
			expect( getByLabelText( 'Public' ) ).toBeChecked();
			expect( getByLabelText( 'Private' ) ).not.toBeChecked();
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

		test( `Selecting Hidden should switch radio to Public`, async () => {
			testProps.fields.blog_public = -1;
			const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

			const hiddenCheckbox = getByLabelText( 'Discourage search engines from indexing this site', {
				exact: false,
			} );
			expect( hiddenCheckbox ).not.toBeChecked();

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio ).not.toBeChecked();

			await userEvent.click( hiddenCheckbox );
			expect( testProps.updateFields ).toBeCalledWith( {
				blog_public: 0,
				wpcom_coming_soon: 0,
				wpcom_public_coming_soon: 0,
			} );
		} );

		test( `Hidden checkbox should be possible to unselect`, async () => {
			testProps.fields.blog_public = 0;
			const { getByLabelText } = renderWithRedux( <SiteSettingsFormGeneral { ...testProps } /> );

			const hiddenCheckbox = getByLabelText( 'Discourage search engines from indexing this site', {
				exact: false,
			} );
			expect( hiddenCheckbox ).toBeChecked();

			const publicRadio = getByLabelText( 'Public' );
			expect( publicRadio ).toBeChecked();

			await userEvent.click( hiddenCheckbox );
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
				test( `${ name } option should be selectable`, async () => {
					testProps.fields.blog_public = initialBlogPublic;
					const { getByLabelText } = renderWithRedux(
						<SiteSettingsFormGeneral { ...testProps } />
					);

					const radioButton = getByLabelText( text, { exact: false } );
					expect( radioButton ).not.toBeChecked();
					await userEvent.click( radioButton );
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

				const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...newProps } /> );
				expect(
					container.querySelectorAll( '.site-settings__visibility-label.is-coming-soon' )
				).toHaveLength( 1 );
			} );

			test( 'Should hide Coming Soon form element when the site is atomic and the editing toolkit plugin is disabled', () => {
				const newProps = {
					...props,
					isAtomicAndEditingToolkitDeactivated: true,
				};
				const { container } = renderWithRedux( <SiteSettingsFormGeneral { ...newProps } /> );
				expect(
					container.querySelectorAll( '.site-settings__visibility-label.is-coming-soon' )
				).toHaveLength( 0 );
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
