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
		).toEqual( { title: 'My Post Title', action: 'Ashar liked your comment' } );
	} );

	it( 'keeps a trailing word that is not a connector', () => {
		expect(
			splitSubject( subjectWithPost( 'Ashar liked your post My Post Title', 'My Post Title' ) )
		).toEqual( { title: 'My Post Title', action: 'Ashar liked your post' } );
	} );

	it( 'strips punctuation joining the two halves', () => {
		expect( splitSubject( subjectWithPost( 'New post: My Post Title', 'My Post Title' ) ) ).toEqual(
			{ title: 'My Post Title', action: 'New post' }
		);
	} );

	it( 'allows punctuation after the post title', () => {
		expect(
			splitSubject( subjectWithPost( 'Ashar commented on My Post Title.', 'My Post Title' ) )
		).toEqual( { title: 'My Post Title', action: 'Ashar commented' } );
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

	it( 'returns null without a subject', () => {
		expect( splitSubject( undefined ) ).toBeNull();
	} );
} );
