type Range = {
	type: string;
	indices: [ number, number ];
	id: number | string;
	parent: number | string | null;
	url?: string;
	site_id?: number;
};

export type Note = {
	id: number;
	type: string;
	read: number;
	noticon: string;
	timestamp: string; // ISO datetime string
	icon: string;
	url: string;
	subject: Array< {
		text: string;
		ranges?: Range[];
	} >;
	body: Array< {
		text: string;
		media?: Array< {
			type: string;
			indices: [ number, number ];
			url: string;
		} >;
		ranges?: Range[];
		meta?: {
			is_mobile_button?: boolean;
		};
	} >;
	meta: {
		ids: {
			site: number;
		};
		links: {
			site: string;
		};
	};
	title: string;
	note_hash: number;
};

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
	noteRequestLimit: number;
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
	updateLastSeenTime: ( proposedTime: number, fromStorage: boolean ) => boolean;
	loadMore: () => void;
	refreshNotes: () => void;
	setVisibility: ( { isShowing, isVisible }: { isShowing: boolean; isVisible: boolean } ) => void;
}
