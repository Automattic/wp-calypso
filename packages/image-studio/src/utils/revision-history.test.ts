import { getRevisionHistory, type RevisionHistoryIds } from './revision-history';
import type { AttachmentRecord } from '../types/wordpress.d';

const attachments: Record< number, AttachmentRecord > = {
	10: { id: 10, source_url: 'https://example.com/10.png', date: '2026-01-01T10:00:00' },
	11: { id: 11, source_url: 'https://example.com/11.png', date: '2026-01-01T11:00:00' },
	12: { id: 12, source_url: 'https://example.com/12.png', date: '2026-01-01T12:00:00' },
	13: { id: 13, source_url: 'https://example.com/13.png', date: '2026-01-01T13:00:00' },
};

const getAttachment = ( id: number ) => attachments[ id ];

function ids( overrides: Partial< RevisionHistoryIds > = {} ): RevisionHistoryIds {
	return {
		originalAttachmentId: 10,
		currentAttachmentId: 12,
		draftIds: [ 11, 12 ],
		savedAttachmentIds: [],
		annotatedIds: [],
		...overrides,
	};
}

describe( 'getRevisionHistory', () => {
	it( 'orders revisions by attachment date, oldest first, and finds the current one', () => {
		const history = getRevisionHistory(
			ids( { draftIds: [ 12, 11 ], currentAttachmentId: 11 } ),
			getAttachment
		);

		expect( history.revisions ).toEqual( [
			{ id: 10, url: 'https://example.com/10.png', date: '2026-01-01T10:00:00' },
			{ id: 11, url: 'https://example.com/11.png', date: '2026-01-01T11:00:00' },
			{ id: 12, url: 'https://example.com/12.png', date: '2026-01-01T12:00:00' },
		] );
		expect( history.currentIndex ).toBe( 1 );
		expect( history.canGoBack ).toBe( true );
		expect( history.canGoForward ).toBe( true );
	} );

	it( 'includes saved attachments and lists each id once', () => {
		const history = getRevisionHistory(
			ids( { draftIds: [ 11, 12, 12 ], savedAttachmentIds: [ 12, 13 ] } ),
			getAttachment
		);

		expect( history.revisions.map( ( revision ) => revision.id ) ).toEqual( [ 10, 11, 12, 13 ] );
	} );

	it( 'drops null ids, annotated ids and attachments that have not loaded', () => {
		const history = getRevisionHistory(
			ids( {
				originalAttachmentId: null,
				draftIds: [ 11, 12, 13, 99 ],
				annotatedIds: [ 13 ],
			} ),
			getAttachment
		);

		expect( history.revisions.map( ( revision ) => revision.id ) ).toEqual( [ 11, 12 ] );
	} );

	it( 'cannot go back at the first revision or forward at the last', () => {
		const first = getRevisionHistory( ids( { currentAttachmentId: 10 } ), getAttachment );
		expect( first.currentIndex ).toBe( 0 );
		expect( first.canGoBack ).toBe( false );
		expect( first.canGoForward ).toBe( true );

		const last = getRevisionHistory( ids( { currentAttachmentId: 12 } ), getAttachment );
		expect( last.currentIndex ).toBe( 2 );
		expect( last.canGoBack ).toBe( true );
		expect( last.canGoForward ).toBe( false );
	} );

	it( 'cannot move with a single revision', () => {
		const history = getRevisionHistory(
			ids( { currentAttachmentId: 10, draftIds: [] } ),
			getAttachment
		);

		expect( history.revisions ).toHaveLength( 1 );
		expect( history.canGoBack ).toBe( false );
		expect( history.canGoForward ).toBe( false );
	} );

	it( 'reports -1 when the current attachment is not in the history', () => {
		const history = getRevisionHistory( ids( { currentAttachmentId: 99 } ), getAttachment );

		expect( history.currentIndex ).toBe( -1 );
		expect( history.canGoBack ).toBe( false );
	} );
} );
