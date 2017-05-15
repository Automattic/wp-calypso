/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { translate } from 'i18n-calypso';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { EditorNotice } from '../';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

describe( 'EditorNotice', () => {
	it( 'should not render a notice if no message is specified', () => {
		const wrapper = shallow( <EditorNotice /> );

		expect( wrapper ).to.not.have.descendants( Notice );
	} );

	it( 'should display an no content error message if recognized', () => {
		const spy = sinon.stub();

		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				status="is-error"
				message="publishFailure"
				isSitePreviewable={ true }
				onViewClick={ spy }
				error={ new Error( 'NO_CONTENT' ) } />
		);

		expect( wrapper.find( Notice ) ).to.not.have.descendants( NoticeAction );
		expect( wrapper.find( Notice ) ).to.have.prop( 'text' ).equal( 'You haven\'t written anything yet!' );
		expect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-error' );
		expect( wrapper.find( Notice ) ).to.have.prop( 'showDismiss' ).be.true;
	} );

	it( 'should display a fallback error message', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				type="post"
				status="is-error"
				message="publishFailure"
				error={ new Error() } />
		);

		expect( wrapper ).to.have.descendants( Notice );
		expect( wrapper.find( Notice ) ).to.have.prop( 'text' ).equal( 'Publishing of post failed.' );
		expect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-error' );
		expect( wrapper.find( Notice ) ).to.have.prop( 'showDismiss' ).be.true;
	} );

	it( 'should display publish success for page', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				message="published"
				status="is-success"
				type="page"
				link="https://example.wordpress.com/published-page"
				action="view"
				site={ {
					URL: 'https://example.wordpress.com',
					title: 'Example Site',
					slug: 'example.wordpress.com',
				} } />
		);

		expect( wrapper.find( Notice ) ).to.have.prop( 'text' ).eql(
			translate( 'Page published on {{siteLink/}}! {{a}}Add another page{{/a}}', {
				components: {
					siteLink: <a href="https://example.wordpress.com" target="_blank" rel="noopener noreferrer">Example Site</a>,
					a: <a href="/page/example.wordpress.com" />,
				}
			} )
		);
		expect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-success' );
		expect( wrapper.find( NoticeAction ) ).to.have.prop( 'href' ).equal( 'https://example.wordpress.com/published-page' );
		expect( wrapper.find( NoticeAction ) ).to.have.prop( 'children' ).equal( 'View Page' );
	} );

	it( 'should display custom post type view label', () => {
		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				type="jetpack-portfolio"
				typeObject={ {
					labels: {
						view_item: 'View Project'
					}
				} }
				message="published"
				status="is-success"
				link="https://example.wordpress.com/published-project"
				action="view"
				site={ {
					URL: 'https://example.wordpress.com',
					title: 'Example Site'
				} } />
		);

		expect( wrapper.find( Notice ) ).to.have.prop( 'text' ).eql(
			translate( 'Post published on {{siteLink/}}!', {
				components: {
					siteLink: <a href="https://example.wordpress.com" target="_blank" rel="noopener noreferrer">Example Site</a>
				}
			} )
		);
		expect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-success' );
		expect( wrapper.find( NoticeAction ) ).to.have.prop( 'href' ).equal( 'https://example.wordpress.com/published-project' );
		expect( wrapper.find( NoticeAction ) ).to.have.prop( 'children' ).equal( 'View Project' );
	} );

	it( 'should use onViewClick function if provided a previewable site', () => {
		const spy = sinon.spy();

		const wrapper = shallow(
			<EditorNotice
				translate={ translate }
				message="published"
				status="is-success"
				type="page"
				link="https://example.wordpress.com/published-page"
				action="view"
				isSitePreviewable={ true }
				onViewClick={ spy }
				site={ {
					URL: 'https://example.wordpress.com',
					title: 'Example Site',
					slug: 'example.wordpress.com',
				} } />
		);

		expect( wrapper.find( Notice ) ).to.have.prop( 'text' ).eql(
			translate( 'Page published on {{siteLink/}}! {{a}}Add another page{{/a}}', {
				components: {
					siteLink: <a href="https://example.wordpress.com" target="_blank" rel="noopener noreferrer">Example Site</a>,
					a: <a href="/page/example.wordpress.com" />,
				}
			} )
		);
		expect( wrapper.find( Notice ) ).to.have.prop( 'status' ).equal( 'is-success' );
		expect( wrapper.find( NoticeAction ) ).to.have.prop( 'children' ).equal( 'View Page' );
		expect( wrapper.find( NoticeAction ) ).to.have.prop( 'onClick' ).equal( spy );
		wrapper.find( NoticeAction ).simulate( 'click' );
		expect( spy ).to.have.been.calledOnce;
	} );
} );
