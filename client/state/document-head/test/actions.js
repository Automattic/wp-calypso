/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DOCUMENT_HEAD_LINK_ADD,
	DOCUMENT_HEAD_META_ADD,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET
} from 'state/action-types';

import {
	setDocumentHeadTitle,
	setDocumentHeadDescription,
	addDocumentHeadLink,
	addDocumentHeadMeta,
	setDocumentHeadUnreadCount
} from '../actions';

describe( 'actions', () => {
	describe( '#setDocumentHeadTitle()', () => {
		it( 'should return an action object', () => {
			const action = setDocumentHeadTitle( 'Home' );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_TITLE_SET,
				title: 'Home'
			} );
		} );
	} );

	describe( '#setDocumentHeadDescription()', () => {
		it( 'should return an action object', () => {
			const action = setDocumentHeadDescription( 'Lorem ipsum dolor sit amet.' );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_META_ADD,
				meta: {
					name: 'description',
					content: 'Lorem ipsum dolor sit amet.'
				}
			} );
		} );
	} );

	describe( '#setDocumentHeadUnreadCount()', () => {
		it( 'should return an action object', () => {
			const action = setDocumentHeadUnreadCount( 123 );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_UNREAD_COUNT_SET,
				count: 123
			} );
		} );
	} );

	describe( '#addDocumentHeadLink()', () => {
		it( 'should return an action object', () => {
			const action = addDocumentHeadLink( { rel: 'some-rel', content: 'some-content' } );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_LINK_ADD,
				link: { rel: 'some-rel', content: 'some-content' }
			} );
		} );
	} );

	describe( '#addDocumentHeadMeta()', () => {
		it( 'should return an action object', () => {
			const action = addDocumentHeadMeta( { rel: 'some-rel', content: 'some-content' } );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_META_ADD,
				meta: { rel: 'some-rel', content: 'some-content' }
			} );
		} );
	} );
} );
