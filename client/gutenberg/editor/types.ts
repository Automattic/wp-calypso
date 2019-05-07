/**
 * Internal dependencies
 */

/**
 * Types
 */
import * as T from 'types';

export enum EditorActions {
	GoToAllPosts = 'goToAllPosts',
	OpenMediaModal = 'openMediaModal',
	OpenRevisions = 'openRevisions',
	PreviewPost = 'previewPost',
	SetDraftId = 'draftIdSet',
	TrashPost = 'trashPost',
}

export enum WindowActions {
	Loaded = 'loaded',
	ClassicBlockOpenMediaModel = 'classicBlockOpenMediaModal',
}

export interface MediaModalData {
	allowedTypes: any;
	gallery: any;
	multiple: boolean;
	value: any;
}

export type MessageToCalypso =
	| { action: EditorActions.GoToAllPosts; payload?: { unsavedChanges: boolean } }
	| { action: EditorActions.OpenMediaModal; payload: MediaModalData }
	| { action: EditorActions.OpenRevisions }
	| { action: EditorActions.PreviewPost; payload: { postUrl: T.URL } }
	| { action: EditorActions.SetDraftId; payload: { postId: T.PostId } }
	| { action: EditorActions.TrashPost };

// Message Channels

export interface PortToCalypso extends MessagePort {
	postMessage: ( message: MessageToCalypso, transfers?: Transferable[] ) => void;
}

export interface PreviewPort extends MessagePort {
	postMessage: ( message: { previewUrl: T.URL; editedPost: object } ) => void;
}

export interface PreviewChannel extends MessageChannel {
	readonly port1: PreviewPort;
	readonly port2: PreviewPort;
}
