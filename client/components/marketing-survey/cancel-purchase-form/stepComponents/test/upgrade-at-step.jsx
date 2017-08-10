/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import { stub } from 'sinon';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { UpgradeATStep } from '../upgrade-at-step';

describe( 'UpgradeATStep', function() {
	const selectedSite = { slug: 'site_slug' };

	describe( 'rendering translated content', function() {
		let wrapper;
		const translate = content => `Translated: ${ content }`;

		beforeEach( function() {
			wrapper = shallow(
				<UpgradeATStep
					recordTracksEvent={ noop }
					translate={ translate }
					selectedSite={ selectedSite }
				/>
			);
		} );

		it( 'should render translated heading content', function() {
			expect( wrapper.find( 'FormSectionHeading' ).props().children ).to.equal(
				'Translated: New! Install Custom Plugins and Themes'
			);
		} );

		it( 'should render translated link content', function() {
			expect( wrapper.find( 'FormFieldset > p' ).props().children ).to.equal(
				'Translated: Did you know that you can now use third-party plugins and themes on the WordPress.com Business plan? ' +
					'Claim a 25% discount when you upgrade your site today - {{b}}enter the code BIZC25 at checkout{{/b}}.'
			);
		} );

		it( 'should render translated confirmation content', function() {
			expect( wrapper.find( 'FormFieldset > Button' ).props().children ).to.equal(
				'Translated: Upgrade My Site'
			);
		} );
	} );

	it( 'should render button with link to business plan checkout', function() {
		const wrapper = shallow(
			<UpgradeATStep recordTracksEvent={ noop } translate={ noop } selectedSite={ selectedSite } />
		);

		expect( wrapper.find( 'Button' ).props().href ).to.equal( '/checkout/site_slug/business' );
	} );

	it( 'should fire tracks event when button is clicked', function() {
		const recordTracksEvent = stub();
		const wrapper = shallow(
			<UpgradeATStep
				recordTracksEvent={ recordTracksEvent }
				translate={ noop }
				selectedSite={ selectedSite }
			/>
		);

		wrapper.find( 'Button' ).simulate( 'click' );

		expect( recordTracksEvent ).to.have.been.calledWith(
			'calypso_cancellation_upgrade_at_step_upgrade_click'
		);
	} );
} );
