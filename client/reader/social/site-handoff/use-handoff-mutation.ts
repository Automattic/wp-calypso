import { useMutation } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { logToLogstash } from 'calypso/lib/logstash';
import {
	saveDraftMutation,
	type SaveDraftMutationResult,
	type SaveDraftMutationVariables,
} from 'calypso/reader/social/composer/use-save-draft-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { Site } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

export interface HandoffTracks {
	editorOpened?: ( siteId: number ) => { event: string; props: Record< string, unknown > };
	errorShown?: (
		siteId: number,
		errorKind: string
	) => { event: string; props: Record< string, unknown > };
}

export interface UseHandoffMutationOptions {
	tracks?: HandoffTracks;
	caller: string;
	onSuccess?: () => void;
}

export interface HandoffMutationApi {
	submit: ( params: { site: Site; content: string } ) => void;
	isPending: boolean;
}

function deriveEditorUrl( site: Site, postId: number ): string {
	const adminUrl = site.options?.admin_url ?? `${ site.URL.replace( /\/$/, '' ) }/wp-admin/`;
	return addQueryArgs( `${ adminUrl }post.php`, {
		post: postId,
		action: 'edit',
	} );
}

export function useHandoffMutation( options: UseHandoffMutationOptions ): HandoffMutationApi {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const { mutate, isPending } = useMutation( saveDraftMutation() );

	const submit = ( { site, content }: { site: Site; content: string } ) => {
		// Open the tab synchronously inside the click's user-gesture window so
		// popup blockers don't reject the later navigation. We point it at
		// about:blank now and redirect it to the editor URL once the draft
		// saves. We can't pass 'noopener,noreferrer' here — that makes
		// `window.open` return null and leaves us with no handle to redirect.
		// Instead we sever `opener` manually right after, which gives us the
		// same protection (the editor tab can't reach back into Reader). If
		// the user has popups blocked entirely, `pending` is null and we fall
		// back to the success-notice retry button.
		const pending = window.open( 'about:blank', '_blank' );
		if ( pending ) {
			try {
				pending.opener = null;
			} catch {
				// Some browsers throw on cross-origin opener writes — ignore.
			}
		}

		mutate( { siteId: site.ID, content } satisfies SaveDraftMutationVariables, {
			onSuccess: ( data: SaveDraftMutationResult ) => {
				const editorUrl = deriveEditorUrl( site, data.ID );
				if ( pending ) {
					pending.location.href = editorUrl;
				} else {
					dispatch(
						successNotice( translate( 'Draft saved.' ), {
							button: translate( 'Open in editor' ),
							onClick: () => {
								window.open( editorUrl, '_blank', 'noopener,noreferrer' );
							},
						} )
					);
				}
				// Fire the editor-opened Tracks event from the success path so
				// it matches its name: the draft is saved and the tab is now
				// navigating (or the user has the success-notice retry
				// button). On error, only `errorShown` fires below — Track
				// dashboards see one outcome event per submit instead of an
				// `editor_opened` that overlaps with `error_shown`.
				if ( options.tracks?.editorOpened ) {
					const { event, props } = options.tracks.editorOpened( site.ID );
					if ( event ) {
						dispatch( recordReaderTracksEvent( event, props ) );
					}
				}
				options.onSuccess?.();
			},
			onError: ( error: Error ) => {
				pending?.close();
				dispatch(
					errorNotice(
						translate( 'Couldn’t save your draft. Try again or pick a different site.' )
					)
				);
				const errorKind = error.name || 'unknown';
				if ( options.tracks?.errorShown ) {
					const { event: errEvent, props: errProps } = options.tracks.errorShown(
						site.ID,
						errorKind
					);
					if ( errEvent ) {
						dispatch( recordReaderTracksEvent( errEvent, errProps ) );
					}
				}
				logToLogstash( {
					feature: 'calypso_client',
					message: 'Reader social site handoff: save draft failed',
					severity: 'error',
					extra: {
						type: 'reader_social_site_handoff_save_draft_error',
						caller: options.caller,
						site_id: site.ID,
						error_message: error.message,
					},
				} );
			},
		} );
	};

	return { submit, isPending };
}
