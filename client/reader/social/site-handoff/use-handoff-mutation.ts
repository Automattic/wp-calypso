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

export interface UseHandoffMutationOptions {
	tracks: {
		editorOpened: ( siteId: number ) => { event: string; props: object };
		errorShown: ( siteId: number, errorKind: string ) => { event: string; props: object };
	};
	caller: string;
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
		const { event, props } = options.tracks.editorOpened( site.ID );
		dispatch( recordReaderTracksEvent( event, props ) );

		mutate( { siteId: site.ID, content } satisfies SaveDraftMutationVariables, {
			onSuccess: ( data: SaveDraftMutationResult ) => {
				const editorUrl = deriveEditorUrl( site, data.ID );
				const newWindow = window.open( editorUrl, '_blank', 'noopener,noreferrer' );
				if ( ! newWindow ) {
					dispatch(
						successNotice( translate( 'Draft saved.' ), {
							button: translate( 'Open in editor' ),
							onClick: () => {
								window.open( editorUrl, '_blank', 'noopener,noreferrer' );
							},
						} )
					);
				}
			},
			onError: ( error: Error ) => {
				dispatch(
					errorNotice(
						translate( 'Couldn’t save your draft. Try again or pick a different site.' )
					)
				);
				const errorKind = error.name || 'unknown';
				const { event: errEvent, props: errProps } = options.tracks.errorShown(
					site.ID,
					errorKind
				);
				dispatch( recordReaderTracksEvent( errEvent, errProps ) );
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
