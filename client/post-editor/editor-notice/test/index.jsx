/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { translate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { EditorNotice } from '../';
import Notice from 'components/notice';

describe( 'EditorNotice', () => {
	test( 'should not render a notice if no message is specified', () => {
		const wrapper = shallow( <EditorNotice /> );

		expect( wrapper ).to.not.have.descendants( Notice );
	} );

	test( 'should display an no content error message if recognized', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				status="is-error"
				message="publishFailure"
				error={ new Error( 'NO_CONTENT' ) }
			/>
		);

		expect( wrapper.find( Notice ) )
			.to.have.prop( 'text' )
			.equal( "You haven't written anything yet!" );
		expect( wrapper.find( Notice ) )
			.to.have.prop( 'status' )
			.equal( 'is-error' );
		expect( wrapper.find( Notice ) ).to.have.prop( 'showDismiss' ).be.true;
	} );

	test( 'should display a fallback error message', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				type="post"
				status="is-error"
				message="publishFailure"
				error={ new Error() }
			/>
		);

		expect( wrapper ).to.have.descendants( Notice );
		expect( wrapper.find( Notice ) )
			.to.have.prop( 'text' )
			.equal( 'Publishing of post failed.' );
		expect( wrapper.find( Notice ) )
			.to.have.prop( 'status' )
			.equal( 'is-error' );
		expect( wrapper.find( Notice ) ).to.have.prop( 'showDismiss' ).be.true;
	} );

	test( 'should display publish success for page', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				message="published"
				status="is-success"
				type="page"
				site={ {
					URL: 'https://example.wordpress.com',
					title: 'Example Site',
					slug: 'example.wordpress.com',
				} }
			/>
		);

		expect( wrapper.find( Notice ) )
			.to.have.prop( 'text' )
			.eql(
				translate( 'Page published on {{siteLink/}}! {{a}}Add another page{{/a}}', {
					components: {
						siteLink: (
							<a href="https://example.wordpress.com" target="_blank" rel="noopener noreferrer">
								Example Site
							</a>
						),
						a: <a href="/page/example.wordpress.com" />,
					},
				} )
			);
		expect( wrapper.find( Notice ) )
			.to.have.prop( 'status' )
			.equal( 'is-success' );
	} );

	test( 'should display custom post type view label', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				type="jetpack-portfolio"
				typeObject={ {
					labels: {
						view_item: 'View Project',
					},
				} }
				message="published"
				status="is-success"
				site={ {
					URL: 'https://example.wordpress.com',
					title: 'Example Site',
				} }
			/>
		);

		expect( wrapper.find( Notice ) )
			.to.have.prop( 'text' )
			.eql(
				translate( 'Post published on {{siteLink/}}!', {
					components: {
						siteLink: (
							<a href="https://example.wordpress.com" target="_blank" rel="noopener noreferrer">
								Example Site
							</a>
						),
					},
				} )
			);
		expect( wrapper.find( Notice ) )
			.to.have.prop( 'status' )
			.equal( 'is-success' );
	} );
} );
