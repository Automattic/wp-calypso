/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import React from 'react';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import { BusinessATStep } from '../business-at-step';

describe( 'BusinessATStep', function() {
	describe( 'rendering translated content', function() {
		let wrapper;
		const translate = ( content ) => `Translated: ${ content }`;

		beforeEach( function() {
			wrapper = shallow(
				<BusinessATStep recordTracksEvent={ noop } translate={ translate } />
			);
		} );

		it( 'should render translated heading content', function() {
			expect(
				wrapper.find( 'FormSectionHeading' ).props().children
			).to.equal(
				'Translated: New! Install Custom Plugins and Themes'
			);
		} );

		it( 'should render translated link content', function() {
			expect(
				wrapper.find( 'FormFieldset > p' ).at( 0 ).props().children
			).to.equal(
				'Translated: Have a theme or plugin you need to install to build the site you want? ' +
				'Now you can! ' +
				'Learn more about {{pluginLink}}installing plugins{{/pluginLink}} and ' +
				'{{themeLink}}uploading themes{{/themeLink}} today.',
			);
		} );

		it( 'should render translated confirmation content', function() {
			expect(
				wrapper.find( 'FormFieldset > p' ).at( 1 ).props().children
			).to.equal(
				'Translated: Are you sure you want to cancel your subscription and lose access to these new features?'
			);
		} );
	} );

	describe( 'rendered links', function() {
		const translate = ( content, params ) => {
			if ( params && params.components ) {
				return (
					<div>
						{ params.components.pluginLink }
						{ params.components.themeLink }
					</div>
				);
			}
			return null;
		};
		let recordTracksEvent, wrapper;

		beforeEach( function() {
			recordTracksEvent = stub();
			wrapper = shallow(
				<BusinessATStep translate={ translate } recordTracksEvent={ recordTracksEvent } />
			);
		} );

		it( 'should fire tracks event for plugin support link when clicked', function() {
			wrapper.find( 'a' ).at( 0 ).simulate( 'click' );

			expect( recordTracksEvent ).to.have.been.calledWith( 'calypso_cancellation_business_at_plugin_support_click' );
		} );

		it( 'should fire tracks event for theme support link when clicked', function() {
			wrapper.find( 'a' ).at( 1 ).simulate( 'click' );

			expect( recordTracksEvent ).to.have.been.calledWith( 'calypso_cancellation_business_at_theme_support_click' );
		} );
	} );
} );
