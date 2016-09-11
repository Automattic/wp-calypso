/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { CommentButton } from 'blocks/comment-button';
import Gridicon from 'components/gridicon';
import { translate, numberFormat } from 'i18n-calypso';

// make sure we can translate when shallow rendering
CommentButton.prototype.translate = translate;
CommentButton.prototype.numberFormat = numberFormat;

describe( 'CommentButton', function() {
	const props = {
		postId: 1,
		siteId: 1
	};

	it( 'returns li element by default', function() {
		const wrapper = shallow( <CommentButton { ...props } /> );
		expect( wrapper.type() ).to.equal( 'li' );
	} );

	it( 'returns element with the specified tag', function() {
		props.tagName = 'div';
		const wrapper = shallow( <CommentButton { ...props } /> );
		expect( wrapper.type() ).to.equal( 'div' );
	} );

	it( 'returns comment Gridicon with size 24 by default', function() {
		const wrapper = shallow( <CommentButton { ...props } /> );
		const gridiconWrapper = wrapper.find( Gridicon );
		expect( gridiconWrapper.length ).to.equal( 1 );
		expect( gridiconWrapper.prop('icon' ) ).to.equal( 'comment' );
		expect( gridiconWrapper.prop( 'size' ) ).to.equal( 24 );
	} );

	it( 'returns comment Gridicon with given size', function() {
		props.size = 12;
		const wrapper = shallow( <CommentButton { ...props } /> );
		const gridiconWrapper = wrapper.find( Gridicon );
		expect( gridiconWrapper.length ).to.equal( 1 );
		expect( gridiconWrapper.prop( 'icon' ) ).to.equal( 'comment' );
		expect( gridiconWrapper.prop( 'size' ) ).to.equal( 12 );
	} );

	it( 'does not show number of comments if there are 0', function() {
		const wrapper = shallow( <CommentButton { ...props } /> );
		const commentCount = wrapper.find( '.comment-button__label-count' );
		expect( commentCount.length ).to.equal( 0 );
	} );

	it( 'shows the number of comments if there are more than 0', function() {
		props.count = 2;
		const wrapper = shallow( <CommentButton { ...props } /> );
		const commentCount = wrapper.find( '.comment-button__label-count' );
		expect( commentCount.length ).to.equal( 1 );
		expect( commentCount.text() ).to.equal( '2' );
	} );

	it( 'shows the comment label by default', function() {
		props.count = 0;
		const wrapper = shallow( <CommentButton { ...props } /> );
		const commentLabel = wrapper.find( '.comment-button__label-status' );
		expect( commentLabel.length ).to.equal( 1 );
		expect( commentLabel.text() ).to.equal( 'Comment' );
	} );

	it( 'does not show comment label if set to false', function() {
		props.showLabel = false;
		const wrapper = shallow( <CommentButton { ...props } /> );
		const commentLabel = wrapper.find( '.comment-button__label-status' );
		expect( commentLabel.length ).to.equal( 0 );
	} );
} );
