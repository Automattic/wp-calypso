/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	DOCUMENT_HEAD_LINK_SET,
	DOCUMENT_HEAD_META_SET,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET
} from 'state/action-types';

import {
	setDocumentHeadTitle,
	setDocumentHeadLink,
	setDocumentHeadMeta,
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

	describe( '#setDocumentHeadUnreadCount()', () => {
		it( 'should return an action object', () => {
			const action = setDocumentHeadUnreadCount( 123 );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_UNREAD_COUNT_SET,
				count: 123
			} );
		} );
	} );

	describe( '#setDocumentHeadLink()', () => {
		it( 'should return an action object', () => {
			const action = setDocumentHeadLink( { rel: 'some-rel', content: 'some-content' } );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_LINK_SET,
				link: { rel: 'some-rel', content: 'some-content' }
			} );
		} );
	} );

	describe( '#setDocumentHeadMeta()', () => {
		it( 'should return an action object', () => {
			const action = setDocumentHeadMeta( { rel: 'some-rel', content: 'some-content' } );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_META_SET,
				meta: { rel: 'some-rel', content: 'some-content' }
			} );
		} );
	} );
} );
