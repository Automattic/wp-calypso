import type { Note } from '../common/types';
import type { getFilters } from '../panel/templates/filters';

export type { Subject, Block, BlockWithSignature, Note } from '../common/types';

export type FilterName = keyof ReturnType< typeof getFilters >;

type Inbox = {
	note_id: number;
	action: 'push';
};

export interface Client {
	noteList: Note[];
	gettingNotes: boolean;
	timeout: boolean;
	isVisible: boolean;
	isShowing: boolean;
	lastSeenTime: number;
	filter: Record< string, unknown > | null;
	filteredHasMore: Record< string, boolean >;
	gettingFilteredNotes: boolean;
	retries: number;
	subscribeTry: number;
	subscribeTries: number;
	subscribing: boolean;
	subscribed: boolean;
	firstRender: boolean;
	locale: string | null;
	inbox: Inbox[];

	main: () => void;
	reschedule: ( refresh_ms?: number ) => void;
	getNote: ( note_id: number ) => void;
	getNotes: () => void;
	getNotesList: () => void;
	getFilteredNotes: ( before?: number ) => void;
	setFilter: ( filterName: FilterName ) => void;
	updateLastSeenTime: ( proposedTime: number, fromStorage: boolean ) => boolean;
	loadMore: () => void;
	hasMoreNotes: ( filterName?: FilterName ) => boolean;
	refreshNotes: () => void;
	setVisibility: ( { isShowing, isVisible }: { isShowing: boolean; isVisible: boolean } ) => void;
}
