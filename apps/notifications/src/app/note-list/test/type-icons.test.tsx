import { getTypeIcon } from '../type-icons';
import type { Note } from '../../types';

const note = ( fields: Partial< Note > ) => ( { type: 'comment', noticon: '', ...fields } ) as Note;

describe( 'getTypeIcon', () => {
	it( 'tells replies apart from comments by their parent comment', () => {
		const comment = getTypeIcon( note( { noticon: '\uf300' } ) );
		const reply = getTypeIcon(
			note( { noticon: '\uf300', meta: { ids: { parent_comment: 1 } } } )
		);

		expect( reply ).not.toBe( comment );
		expect( reply ).toBe( getTypeIcon( note( { noticon: '\uf467' } ) ) );
	} );

	it( 'keeps the like icon for likes of a reply', () => {
		const like = getTypeIcon( note( { type: 'like', noticon: '\uf408' } ) );

		expect(
			getTypeIcon(
				note( { type: 'comment_like', noticon: '\uf408', meta: { ids: { parent_comment: 1 } } } )
			)
		).toBe( like );
	} );

	it( 'picks the icon from the note type for posts and new subscribers', () => {
		expect( getTypeIcon( note( { type: 'new_post', noticon: '\uf300' } ) ) ).toBe(
			getTypeIcon( note( { type: 'new_post', noticon: '\uf408' } ) )
		);
		expect( getTypeIcon( note( { type: 'follow', noticon: '\uf408' } ) ) ).toBe(
			getTypeIcon( note( { noticon: '\uf801' } ) )
		);
	} );

	it( 'shows a lock for security notes', () => {
		const lock = getTypeIcon( note( { type: 'automattcher', noticon: '\uf470' } ) );

		expect( lock ).not.toBe( getTypeIcon( note( { noticon: '\uf455' } ) ) );
	} );

	it( 'marks warnings with a class rather than an inline fill, so a pending note can recolor them', () => {
		const warning = getTypeIcon( note( { type: 'automattcher', noticon: '\uf414' } ) );

		expect( warning.props.className ).toBe( 'is-warning' );
	} );

	it( 'falls back to the info icon for other notes', () => {
		const info = getTypeIcon( note( { noticon: '\uf455' } ) );

		expect( getTypeIcon( note( { type: 'stats', noticon: '\uf806' } ) ) ).toBe( info );
		expect( getTypeIcon( note( { type: 'unknown', noticon: '' } ) ) ).toBe( info );
	} );
} );
