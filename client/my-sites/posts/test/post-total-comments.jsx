/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import { PurePostTotalComments } from '../post-total-comments';
import Gridicon from 'components/gridicon';
import { translate, numberFormat } from 'i18n-calypso';

// make sure we can translate when shallow rendering
PurePostTotalComments.prototype.translate = translate;
PurePostTotalComments.prototype.numberFormat = numberFormat;

describe('PostTotalComments', function() {
	let props = {
		clickHandler: noop,
		siteId: 1,
		postId: 1
	};

	describe('when comments are open', function() {
		before(function() {
			props.commentsOpen = true;
			props.syncedCount = undefined;
		} );

		it('shows only the comment icon when there are 0 comments', function() {
			props.originalCount = 0;

			const wrapper = shallow( <PurePostTotalComments {...props} /> );
			expect(wrapper.find(Gridicon).length).to.equal(1);

			const commentCountDisplay = wrapper.find('span');
			expect(commentCountDisplay.length).to.equal(1);
			expect(commentCountDisplay.text()).to.equal('');
		} );

		it('shows only the comment icon when comment count is not a number', function() {
			props.originalCount = undefined;

			const wrapper = shallow( <PurePostTotalComments {...props} /> );
			expect(wrapper.find(Gridicon).length).to.equal(1);

			const commentCountDisplay = wrapper.find('span');
			expect(commentCountDisplay.length).to.equal(1);
			expect(commentCountDisplay.text()).to.equal('');
		} );

		it('shows the comments icon and number when there are comments', function() {
			props.originalCount = 10;

			const wrapper = shallow( <PurePostTotalComments {...props} /> );
			expect(wrapper.find(Gridicon).length).to.equal(1);

			const commentCountDisplay = wrapper.find('span');
			expect(commentCountDisplay.length).to.equal(1);
			expect(commentCountDisplay.text()).to.equal('10');
		} );

		it('updates the comment number when comment count is changed', function() {
			props.syncedCount = 10;

			const wrapper = shallow( <PurePostTotalComments {...props} /> );
			let commentCountDisplay = wrapper.find('span');
			expect(commentCountDisplay.text()).to.equal('10');

			wrapper.setProps({syncedCount: 11} );
			commentCountDisplay = wrapper.find('span');
			expect(commentCountDisplay.text()).to.equal('11');
		} );
	} );

	describe('when comments are closed', function() {
		before(function() {
			props.commentsOpen = false;
			props.syncedCount = undefined;
		} );

		it('returns null when there are 0 comments', function() {
			props.originalCount = 0;
			const wrapper = shallow( <PurePostTotalComments {...props} /> );
			expect(wrapper.type()).to.equal(null);
		} );

		it('returns null when comment count is not a number', function() {
			props.originalCount = undefined;
			const wrapper = shallow( <PurePostTotalComments {...props} /> );
			expect(wrapper.type()).to.equal(null);
		} );

		it('shows the comments icon and number when there are comments', function() {
			props.originalCount = 5;

			const wrapper = shallow( <PurePostTotalComments {...props} /> );
			expect(wrapper.find(Gridicon).length).to.equal(1);

			const commentCountDisplay = wrapper.find('span');
			expect(commentCountDisplay.length).to.equal(1);
			expect(commentCountDisplay.text()).to.equal('5');
		} );

		it('updates the comment number when comment count is changed', function() {
			props.syncedCount = 10;

			const wrapper = shallow( <PurePostTotalComments {...props} /> );
			let commentCountDisplay = wrapper.find('span');
			expect(commentCountDisplay.text()).to.equal('10');

			wrapper.setProps({syncedCount: 11} );
			commentCountDisplay = wrapper.find('span');
			expect(commentCountDisplay.text()).to.equal('11');
		} );
	} );

	describe('#getCommentCount()', function() {
		it('should return the synced comment total if defined', function() {
			const syncedCount = 2;
			const originalCount = 1;
			const result = PurePostTotalComments.prototype.getCommentCount(
				syncedCount, originalCount);
			expect(result).to.equal(syncedCount);
		} );

		it('should return the original comment count when synced comment total is undefined', function() {
			PurePostTotalComments.prototype.props = {
				syncedCount: undefined,
				originalCount: 1
			};

			const resultNumber = PurePostTotalComments.prototype.getCommentCount();
			expect(resultNumber).to.equal(1);

			PurePostTotalComments.prototype.props.originalCount = undefined;
			const resultUndefined = PurePostTotalComments.prototype.getCommentCount();
			expect(resultUndefined).to.equal(undefined);
		} );
	} );
} );
