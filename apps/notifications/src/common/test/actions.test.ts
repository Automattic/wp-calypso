import { getActions, getAvailableNoteActions, getReferenceId } from '../actions';
import type { Note } from '../types';

const makeNote = ( overrides: Partial< Note > = {} ): Note =>
	( {
		id: 42,
		type: 'comment',
		read: 0,
		timestamp: '2026-08-27T00:00:00+00:00',
		meta: { ids: { site: 7, post: 5, comment: 9 } },
		subject: [ { text: 'Subject' } ],
		body: [],
		...overrides,
	} ) as Note;

describe( 'getActions', () => {
	it( 'reads the last body block with actions', () => {
		const note = makeNote( {
			body: [
				{ text: 'first', actions: { 'like-post': true } },
				{ text: 'ignored' },
				{ text: 'last', actions: { 'approve-comment': false } },
			] as Note[ 'body' ],
		} );
		expect( getActions( note ) ).toEqual( { 'approve-comment': false } );
	} );

	it( 'returns an empty object without an actions block', () => {
		expect( getActions( makeNote() ) ).toEqual( {} );
	} );
} );

describe( 'getReferenceId', () => {
	it( 'reads ids from note meta', () => {
		expect( getReferenceId( makeNote(), 'comment' ) ).toBe( 9 );
		expect( getReferenceId( makeNote(), 'missing' ) ).toBeNull();
		expect( getReferenceId( makeNote( { meta: undefined } ), 'site' ) ).toBeNull();
	} );
} );

describe( 'getAvailableNoteActions', () => {
	it( 'maps the payload action keys from the last actions block', () => {
		const note = makeNote( {
			body: [
				{ text: 'ignored' },
				{
					text: '',
					actions: {
						'replyto-comment': true,
						'approve-comment': false,
						'like-comment': true,
						'spam-comment': true,
						'trash-comment': true,
						'edit-comment': true,
						'answer-prompt': 'https://example.com/prompt',
					},
				},
			] as Note[ 'body' ],
		} );

		expect( getAvailableNoteActions( note ) ).toEqual( {
			replyToComment: true,
			likePost: false,
			likeComment: true,
			approveComment: true,
			spamComment: true,
			trashComment: true,
			editComment: true,
			answerPromptHref: 'https://example.com/prompt',
			follow: null,
		} );
	} );

	it( 'derives follow-back from a follow note only', () => {
		const body = [
			{ text: '', meta: { ids: { site: 77 } }, actions: { follow: false } },
		] as Note[ 'body' ];

		expect( getAvailableNoteActions( makeNote( { type: 'follow', body } ) ).follow ).toEqual( {
			siteId: 77,
			isFollowing: false,
		} );
		expect( getAvailableNoteActions( makeNote( { type: 'like', body } ) ).follow ).toBeNull();
		expect( getAvailableNoteActions( makeNote( { type: 'comment', body } ) ).follow ).toBeNull();
		expect(
			getAvailableNoteActions( makeNote( { type: 'comment_like', body } ) ).follow
		).toBeNull();
	} );
} );
