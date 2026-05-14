export type SiteWordadsUnsafeValue = false | 'mature' | 'private' | 'spam' | 'other';

export interface SiteWordadsStatus {
	unsafe: SiteWordadsUnsafeValue;
	approved: boolean;
	active: boolean;
}
