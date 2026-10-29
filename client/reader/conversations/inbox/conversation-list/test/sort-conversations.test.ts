import { sortConversations } from '../sort-conversations';
import type { Conversation } from '../../group-notes';

const makeConversation = (
	key: string,
	{
		timestamp,
		notes = 1,
		lastRepliedTimestamp,
	}: { timestamp: number; notes?: number; lastRepliedTimestamp?: number }
): Conversation => ( {
	key,
	siteId: 10,
	postId: Number( key ),
	title: key,
	excerpt: '',
	timestamp,
	lastRepliedTimestamp,
	commenters: [],
	noteIds: Array.from( { length: notes }, ( _, index ) => index ),
	unreadNoteIds: [],
} );

const keys = ( conversations: Conversation[] ) => conversations.map( ( { key } ) => key );

describe( 'sortConversations', () => {
	const conversations = [
		makeConversation( '1', { timestamp: 100, notes: 1 } ),
		makeConversation( '2', { timestamp: 300, notes: 2, lastRepliedTimestamp: 50 } ),
		makeConversation( '3', { timestamp: 200, notes: 3, lastRepliedTimestamp: 150 } ),
		makeConversation( '4', { timestamp: 400, notes: 2 } ),
	];

	it( 'puts the newest note first for newest replies', () => {
		expect( keys( sortConversations( conversations, 'newest_replies' ) ) ).toEqual( [
			'4',
			'2',
			'3',
			'1',
		] );
	} );

	it( 'puts the most notes first for most active, breaking ties by newest', () => {
		expect( keys( sortConversations( conversations, 'most_active' ) ) ).toEqual( [
			'3',
			'4',
			'2',
			'1',
		] );
	} );

	it( 'puts the latest reply to you first for your last reply, then the rest by newest', () => {
		expect( keys( sortConversations( conversations, 'your_last_reply' ) ) ).toEqual( [
			'3',
			'2',
			'4',
			'1',
		] );
	} );

	it( 'leaves the original list alone', () => {
		sortConversations( conversations, 'most_active' );

		expect( keys( conversations ) ).toEqual( [ '1', '2', '3', '4' ] );
	} );
} );
