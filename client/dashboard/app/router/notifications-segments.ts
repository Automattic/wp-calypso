// URL segments for the left-sidebar categories; the screen maps them to the
// engine's filter names ('subscribers' → 'follows'). Kept dependency-free so
// the eagerly-loaded route module never pulls the notifications engine.
const INBOX_CATEGORIES = [ 'unread', 'comments', 'subscribers', 'likes' ];

export const isNoteId = ( segment: string ) => /^\d+$/.test( segment );

export const isInboxCategory = ( segment: string ) => INBOX_CATEGORIES.includes( segment );
