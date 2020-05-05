/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { UpgradeNudge } from '..';
import { FEATURE_CUSTOM_DOMAIN, PLAN_PERSONAL, PLAN_BLOGGER, PLAN_FREE } from 'lib/plans/constants';

describe( 'UpgradeNudge', () => {
	const createProps = ( overrideProps = {} ) => {
		const defaultProps = {
			site: {
				plan: {
					product_slug: PLAN_FREE,
				},
				jetpack: false,
			},
			canManageSite: true,
		};
		return merge( {}, defaultProps, overrideProps );
	};

	describe( 'wrapper', () => {
		test( 'should display with default props', () => {
			const props = createProps();
			const wrapper = shallow( <UpgradeNudge { ...props } /> );

			expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 1 );
		} );

		test( 'should not display without a site', () => {
			const props = createProps();
			delete props.site;
			const wrapper = shallow( <UpgradeNudge { ...props } /> );

			expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 0 );
		} );

		test( 'should not display for paid plans without feature prop (personal)', () => {
			const props = createProps( {
				site: {
					plan: {
						product_slug: PLAN_PERSONAL,
					},
				},
			} );
			delete props.feature;
			const wrapper = shallow( <UpgradeNudge { ...props } /> );

			expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 0 );
		} );

		test( 'should not display for paid plans without feature prop (blogger)', () => {
			const props = createProps( {
				site: {
					plan: {
						product_slug: PLAN_BLOGGER,
					},
				},
			} );
			delete props.feature;
			const wrapper = shallow( <UpgradeNudge { ...props } /> );

			expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 0 );
		} );

		test( "should not display when user can't manage site", () => {
			const props = createProps( { canManageSite: false } );
			const wrapper = shallow( <UpgradeNudge { ...props } /> );

			expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 0 );
		} );

		describe( 'with feature prop', () => {
			test( 'should not display when plan has feature', () => {
				const props = createProps( {
					feature: FEATURE_CUSTOM_DOMAIN,
					planHasFeature: true,
				} );
				const wrapper = shallow( <UpgradeNudge { ...props } /> );

				expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 0 );
			} );

			test( "should display when plan doesn't have feature", () => {
				const props = createProps( {
					feature: FEATURE_CUSTOM_DOMAIN,
					planHasFeature: false,
				} );
				const wrapper = shallow( <UpgradeNudge { ...props } /> );

				expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 1 );
			} );
		} );

		describe( 'with jetpack prop', () => {
			test( 'should not display a jetpack feature for non-jetpack sites', () => {
				const props = createProps( {
					site: {
						jetpack: false,
					},
					jetpack: true,
				} );
				const wrapper = shallow( <UpgradeNudge { ...props } /> );

				expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 0 );
			} );

			test( 'should not display when non-jetpack feature for jetpack sites', () => {
				const props = createProps( {
					site: {
						jetpack: true,
					},
					jetpack: false,
				} );
				const wrapper = shallow( <UpgradeNudge { ...props } /> );

				expect( wrapper.find( '.upgrade-nudge' ) ).toHaveLength( 0 );
			} );
		} );
	} );
} );
