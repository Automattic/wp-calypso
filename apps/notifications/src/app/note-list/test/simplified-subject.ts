import { splitSubject } from '../simplified-subject';
import type { Subject } from '../../types';

const subjectWithPost = ( text: string, title: string, type = 'post' ): Subject => {
	const start = text.indexOf( title );
	return {
		text,
		ranges: [ { type, indices: [ start, start + title.length ], id: 1, parent: null } ],
	};
};

describe( 'splitSubject', () => {
	it( 'drops the connector joining the action to the post title', () => {
		expect(
			splitSubject(
				subjectWithPost( 'Ashar liked your comment on My Post Title', 'My Post Title' )
			)
		).toEqual( { title: 'My Post Title', action: { text: 'Ashar liked your comment' } } );
	} );

	it( 'keeps a trailing word that is not a connector', () => {
		expect(
			splitSubject( subjectWithPost( 'Ashar liked your post My Post Title', 'My Post Title' ) )
		).toEqual( { title: 'My Post Title', action: { text: 'Ashar liked your post' } } );
	} );

	it( 'strips punctuation joining the two halves', () => {
		expect( splitSubject( subjectWithPost( 'New post: My Post Title', 'My Post Title' ) ) ).toEqual(
			{ title: 'My Post Title', action: { text: 'New post' } }
		);
	} );

	it( 'allows punctuation after the post title', () => {
		expect(
			splitSubject( subjectWithPost( 'Ashar commented on My Post Title.', 'My Post Title' ) )
		).toEqual( { title: 'My Post Title', action: { text: 'Ashar commented' } } );
	} );

	it( 'returns null when there is no post range', () => {
		expect( splitSubject( { text: 'Ashar started following your site', ranges: [] } ) ).toBeNull();
	} );

	it( 'returns null when the range is not a post', () => {
		expect(
			splitSubject( subjectWithPost( 'Ashar liked your comment on Ashar', 'Ashar', 'user' ) )
		).toBeNull();
	} );

	it( 'returns null when the post title does not end the sentence', () => {
		expect(
			splitSubject(
				subjectWithPost( 'Ashar commented on My Post Title in your site', 'My Post Title' )
			)
		).toBeNull();
	} );

	it( 'returns null when the post title is the whole sentence', () => {
		expect( splitSubject( subjectWithPost( 'My Post Title', 'My Post Title' ) ) ).toBeNull();
	} );

	it( 'returns null when nothing is left of the action clause', () => {
		expect( splitSubject( subjectWithPost( 'on My Post Title', 'My Post Title' ) ) ).toBeNull();
	} );

	// Real reply payloads: the quoted comment closes the sentence, with its own range.
	it( 'splits a reply on the comment it quotes', () => {
		const text = 'Lucas Mendes replied to your comment Aligns with adams prototype: ';

		expect(
			splitSubject( {
				text,
				ranges: [
					{ type: 'user', indices: [ 0, 12 ] },
					{ type: 'comment', indices: [ 37, 66 ] },
				],
			} as never )
		).toEqual( {
			action: {
				text: 'Lucas Mendes replied to your comment',
				ranges: [ { type: 'user', indices: [ 0, 12 ] } ],
			},
			title: 'Aligns with adams prototype:',
		} );
	} );

	it( 'splits a reply whose quoted comment was truncated', () => {
		const text =
			'Lucas Mendes replied to your comment I understand the reflex to think with first principles and architect \u2026\n';

		expect(
			splitSubject( {
				text,
				ranges: [
					{ type: 'user', indices: [ 0, 12 ] },
					{ type: 'comment', indices: [ 37, 108 ] },
				],
			} as never )
		).toEqual( {
			action: {
				text: 'Lucas Mendes replied to your comment',
				ranges: [ { type: 'user', indices: [ 0, 12 ] } ],
			},
			// The ellipsis is inside the range: the API truncated the comment, and saying so
			// is worth keeping.
			title: 'I understand the reflex to think with first principles and architect \u2026',
		} );
	} );

	it( 'prefers whichever range closes the sentence', () => {
		const text = 'Ashar liked your comment on My Post Title';

		expect(
			splitSubject( {
				text,
				ranges: [
					{ type: 'comment', indices: [ 17, 24 ] },
					{ type: 'post', indices: [ 28, 41 ] },
				],
			} as never )
		).toEqual( {
			action: {
				text: 'Ashar liked your comment',
				ranges: [ { type: 'comment', indices: [ 17, 24 ] } ],
			},
			title: 'My Post Title',
		} );
	} );

	it( 'returns null without a subject', () => {
		expect( splitSubject( undefined ) ).toBeNull();
	} );
} );
