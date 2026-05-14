export type WordadsUnsafeStatus = false | 'mature' | 'private' | 'spam' | 'other';

export interface WordadsStatus {
	approved?: boolean;
	unsafe: WordadsUnsafeStatus;
	active?: boolean;
	status?: string;
}
