/**
 * External dependencies
 */
import { expect as chaiExpect } from 'chai';
import { shallow } from 'enzyme';
import { translate } from 'i18n-calypso';
import React from 'react';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { EditorNotice } from '../';
import Notice from 'components/notice';

describe( 'EditorNotice', () => {
	test( 'should not render a notice if no message is specified', () => {
		const wrapper = shallow( <EditorNotice moment={ moment } /> );

		chaiExpect( wrapper ).to.not.have.descendants( Notice );
	} );

	test( 'should display a no content error message if recognized', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				moment={ moment }
				status="is-error"
				message="publishFailure"
				error={ new Error( 'NO_CONTENT' ) }
			/>
		);

		chaiExpect( wrapper.find( Notice ) )
			.to.have.prop( 'text' )
			.equal( "You haven't written anything yet!" );
		chaiExpect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-error' );
		chaiExpect( wrapper.find( Notice ) ).to.have.prop( 'showDismiss' ).be.true;
	} );

	test( 'should display a fallback error message', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				moment={ moment }
				type="post"
				status="is-error"
				message="publishFailure"
				error={ new Error() }
			/>
		);

		chaiExpect( wrapper ).to.have.descendants( Notice );
		chaiExpect( wrapper.find( Notice ) )
			.to.have.prop( 'text' )
			.equal( 'Publishing of post failed.' );
		chaiExpect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-error' );
		chaiExpect( wrapper.find( Notice ) ).to.have.prop( 'showDismiss' ).be.true;
	} );

	test( 'should display publish success for page', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				moment={ moment }
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

		expect( wrapper ).toMatchSnapshot();
		chaiExpect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-success' );
	} );

	test( 'should display publish success for post', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				moment={ moment }
				message="published"
				status="is-success"
				type="post"
				site={ {
					URL: 'https://example.wordpress.com',
					title: 'Example Site',
					slug: 'example.wordpress.com',
				} }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
		chaiExpect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-success' );
	} );

	test( 'should display publish success for custom post type', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				moment={ moment }
				message="published"
				status="is-success"
				type="jetpack-testimonial"
				site={ {
					URL: 'https://example.wordpress.com',
					title: 'Example Site',
					slug: 'example.wordpress.com',
				} }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
		chaiExpect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-success' );
	} );

	test( 'should display custom post type view label', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				moment={ moment }
				type="jetpack-portfolio"
				typeObject={ {
					labels: {
						view_item: 'View Project',
					},
				} }
				message="view"
				status="is-success"
				site={ {
					URL: 'https://example.wordpress.com',
					title: 'Example Site',
				} }
			/>
		);

		expect( wrapper ).toMatchSnapshot();
		chaiExpect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-success' );
	} );
} );
