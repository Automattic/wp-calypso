/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setDocumentHeadTitle, setDocumentHeadLink, setDocumentHeadMeta } from '../actions';
import {
	DOCUMENT_HEAD_LINK_SET,
	DOCUMENT_HEAD_META_SET,
	DOCUMENT_HEAD_TITLE_SET,
} from 'state/action-types';

describe( 'actions', () => {
	describe( '#setDocumentHeadTitle()', () => {
		test( 'should return an action object', () => {
			const action = setDocumentHeadTitle( 'Home' );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_TITLE_SET,
				title: 'Home',
			} );
		} );
	} );

	describe( '#setDocumentHeadLink()', () => {
		test( 'should return an action object', () => {
			const action = setDocumentHeadLink( { rel: 'some-rel', content: 'some-content' } );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_LINK_SET,
				link: { rel: 'some-rel', content: 'some-content' },
			} );
		} );
	} );

	describe( '#setDocumentHeadMeta()', () => {
		test( 'should return an action object', () => {
			const action = setDocumentHeadMeta( { rel: 'some-rel', content: 'some-content' } );

			expect( action ).to.eql( {
				type: DOCUMENT_HEAD_META_SET,
				meta: { rel: 'some-rel', content: 'some-content' },
			} );
		} );
	} );
} );
