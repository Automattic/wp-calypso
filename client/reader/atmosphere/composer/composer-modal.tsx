import './style.scss';
import { createPostMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { logToLogstash } from 'calypso/lib/logstash';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getThreadUrl } from '../route';
import { ComposerFooter } from './composer-footer';
import { ComposerPinnedContext } from './composer-pinned-context';
import { useComposer, type ActiveMode } from './composer-provider';
import { ComposerTextarea } from './composer-textarea';
import { countGraphemes } from './grapheme-count';
import type { AtmosphereError, CreatePostParams, CreatePostResult } from '@automattic/api-core';
import type { AppState } from 'calypso/types';
import type { ReactNode } from 'react';

const LIMIT = 300;

export function ComposerModal() {
	const translate = useTranslate();
	const { mode, closeComposer } = useComposer();
	const queryClient = useQueryClient();
	const mutation = useMutation( createPostMutation( queryClient ) );
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();

	const [ text, setText ] = useState( '' );
	const [ confirmDiscard, setConfirmDiscard ] = useState( false );
	const lastErrorKindRef = useRef< string | null >( null );

	// Reset state when modal closes.
	useEffect( () => {
		if ( ! mode ) {
			setText( '' );
			setConfirmDiscard( false );
			mutation.reset();
			lastErrorKindRef.current = null;
		}
		// mutation.reset is stable across renders; intentionally not in deps.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ mode ] );

	// Tracks: composer opened.
	useEffect( () => {
		if ( ! mode ) {
			return;
		}
		if ( mode.kind === 'reply' ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_reply_composer_opened', {
					connection_id: mode.connectionId,
					parent_uri: mode.parent.uri,
					root_uri: mode.root.uri,
				} )
			);
			return;
		}
		if ( mode.kind === 'quote' ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_quote_composer_opened', {
					connection_id: mode.connectionId,
					quoted_uri: mode.quote.uri,
				} )
			);
			return;
		}
		if ( mode.kind === 'standalone' ) {
			dispatch(
				recordReaderTracksEvent( 'calypso_reader_atmosphere_compose_opened', {
					connection_id: mode.connectionId,
					entry_point: mode.entry_point,
				} )
			);
		}
	}, [ mode, dispatch ] );

	// Tracks: error_shown with ref-tracked dedupe per error_kind transition.
	useEffect( () => {
		if ( ! mode ) {
			return;
		}
		if ( mutation.isError && mutation.error ) {
			const errorKind = mutation.error.kind;
			if ( errorKind !== lastErrorKindRef.current ) {
				lastErrorKindRef.current = errorKind;
				if ( errorKind === 'bad_request' ) {
					// `bad_request` is the catch-all for non-classified server
					// errors; log the raw response code so the error-copy
					// classifier can be tuned with real production data.
					logToLogstash( {
						feature: 'calypso_client',
						message: 'Atmosphere composer bad_request',
						severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
						extra: {
							env: config( 'env_id' ),
							type: 'reader_atmosphere_composer_bad_request',
							mode: mode.kind,
							error_message: mutation.error.message,
						},
					} );
				}
				if ( mode.kind === 'reply' ) {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_atmosphere_reply_error_shown', {
							connection_id: mode.connectionId,
							parent_uri: mode.parent.uri,
							error_kind: errorKind,
						} )
					);
				} else if ( mode.kind === 'quote' ) {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_atmosphere_quote_error_shown', {
							connection_id: mode.connectionId,
							quoted_uri: mode.quote.uri,
							error_kind: errorKind,
						} )
					);
				} else if ( mode.kind === 'standalone' ) {
					// Standalone has no parent_uri, so it gets its own Tracks event.
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_atmosphere_compose_error_shown', {
							connection_id: mode.connectionId,
							error_kind: errorKind,
						} )
					);
				}
			}
		} else if ( ! mutation.isError ) {
			lastErrorKindRef.current = null;
		}
	}, [ mutation.isError, mutation.error, mode, dispatch ] );

	const graphemeCount = useMemo( () => countGraphemes( text ), [ text ] );

	const handleClose = useCallback( () => {
		if ( mutation.isPending ) {
			return;
		}
		if ( text.trim().length > 0 ) {
			setConfirmDiscard( true );
			return;
		}
		closeComposer();
	}, [ mutation.isPending, text, closeComposer ] );

	const handleSubmit = useCallback( () => {
		if ( ! mode || mutation.isPending ) {
			return;
		}
		// Guard against the Cmd/Ctrl+Enter shortcut bypassing the
		// disabled Post button when the textarea is empty or over the
		// limit. Mirrors the disabled logic in <ComposerFooter>.
		if ( graphemeCount === 0 || graphemeCount > LIMIT ) {
			return;
		}
		const params = buildParamsForMode( mode, text );
		mutation.mutate( params, {
			onSuccess: ( result ) => {
				if ( mode.kind === 'reply' ) {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_atmosphere_reply_published', {
							connection_id: mode.connectionId,
							parent_uri: mode.parent.uri,
							root_uri: mode.root.uri,
						} )
					);
				} else if ( mode.kind === 'quote' ) {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_atmosphere_quote_published', {
							connection_id: mode.connectionId,
							quoted_uri: mode.quote.uri,
							new_post_uri: result.uri,
						} )
					);
				} else if ( mode.kind === 'standalone' ) {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_atmosphere_compose_published', {
							connection_id: mode.connectionId,
						} )
					);
				}
				const { text: noticeText, threadUrl } = successNoticeFor( mode, result, translate );
				const options = threadUrl
					? { button: translate( 'View' ) as string, onClick: () => page( threadUrl ) }
					: undefined;
				dispatch( successNotice( noticeText, options ) );
				closeComposer();
			},
		} );
	}, [ mode, mutation, text, graphemeCount, closeComposer, dispatch, translate ] );

	if ( ! mode ) {
		return null;
	}

	const handle =
		mode.kind === 'reply' || mode.kind === 'quote' ? mode.previewPost.author.handle : undefined;

	const title = titleForMode( mode, translate );
	const placeholder = placeholderForMode( mode, translate, handle );
	const errorMessage =
		mutation.isError && mutation.error ? errorMessageFor( mutation.error, translate ) : null;

	return (
		<>
			<Modal
				title={ title }
				onRequestClose={ handleClose }
				className="atmosphere-composer"
				focusOnMount
				// `size="medium"` pins the frame to a fixed 512px max
				// regardless of pinned-context text length. Without it the
				// frame is content-driven (350px min-width grows to viewport
				// max), so a short reply preview yields a 350px modal and a
				// long one fills the screen.
				size="medium"
			>
				<ComposerPinnedContext mode={ mode } />
				<ComposerTextarea
					value={ text }
					onChange={ setText }
					onSubmit={ handleSubmit }
					placeholder={ placeholder }
					disabled={ mutation.isPending }
					aria-label={ title }
					// Include the error region id when an error is showing so AT
					// users can navigate from the textarea to the explanation.
					aria-describedby={
						errorMessage
							? 'atmosphere-composer-error atmosphere-composer-count'
							: 'atmosphere-composer-count'
					}
					aria-invalid={ errorMessage ? true : undefined }
				/>
				{ errorMessage && (
					<div id="atmosphere-composer-error" className="atmosphere-composer__error" role="alert">
						{ errorMessage }
					</div>
				) }
				<ComposerFooter
					graphemeCount={ graphemeCount }
					onSubmit={ handleSubmit }
					isPending={ mutation.isPending }
					limit={ LIMIT }
				/>
			</Modal>
			{ confirmDiscard && (
				<DiscardConfirm
					onCancel={ () => setConfirmDiscard( false ) }
					onConfirm={ () => {
						setConfirmDiscard( false );
						closeComposer();
					} }
				/>
			) }
		</>
	);
}

function titleForMode( mode: ActiveMode, t: ReturnType< typeof useTranslate > ): string {
	if ( mode.kind === 'reply' ) {
		return t( 'Reply' ) as string;
	}
	if ( mode.kind === 'quote' ) {
		return t( 'Quote post' ) as string;
	}
	return t( 'New post' ) as string;
}

function placeholderForMode(
	mode: ActiveMode,
	t: ReturnType< typeof useTranslate >,
	handle: string | undefined
): string {
	if ( mode.kind === 'reply' ) {
		return t( 'Replying to @%(handle)s…', {
			args: { handle: handle ?? '' },
			comment:
				'Placeholder text in the reply composer; %(handle)s is the Bluesky handle of the user being replied to.',
		} ) as string;
	}
	if ( mode.kind === 'quote' ) {
		return t( 'Add a comment…' ) as string;
	}
	return t( 'What’s up?' ) as string;
}

function buildParamsForMode( mode: ActiveMode, text: string ): CreatePostParams {
	if ( mode.kind === 'reply' ) {
		return {
			connectionId: mode.connectionId,
			text,
			reply: { root: mode.root, parent: mode.parent },
		};
	}
	if ( mode.kind === 'quote' ) {
		return {
			connectionId: mode.connectionId,
			text,
			quote: mode.quote,
			...( mode.replyTo ? { reply: mode.replyTo } : {} ),
		};
	}
	return { connectionId: mode.connectionId, text };
}

function errorMessageFor( err: AtmosphereError, t: ReturnType< typeof useTranslate > ): ReactNode {
	switch ( err.kind ) {
		case 'bad_request':
			// `err.message` is intentionally not surfaced here: the wpcom
			// transport defaults `Error.message` to the response body's
			// `error` code when no user-facing message is provided, so
			// "honoring" it would render strings like "atmosphere_bad_request"
			// to users. A future classifier change could distinguish the two.
			return t( "We couldn't post this. Try shortening your post." );
		case 'text_too_long':
			return t( 'Your post is too long. Try shortening it.' );
		case 'auth_required':
		case 'auth_failed':
		case 'invalid_credentials':
			return t( 'Your Bluesky connection needs to be reconnected. {{a}}Reconnect{{/a}}', {
				components: {
					a: <a href="/reader/atmosphere/connect" target="_blank" rel="noopener noreferrer" />,
				},
				comment:
					'Composer error shown when the user’s Bluesky session expired; {{a}}…{{/a}} wraps a link to reconnect.',
			} );
		case 'reply_disabled':
			return t( 'The author has restricted who can reply to this post.' );
		case 'quote_disabled':
			return t( "This post can't be quoted." );
		case 'rate_limited':
			return t( "You're posting too quickly. Try again in a moment." );
		case 'upstream_unavailable':
			return t( 'Bluesky is taking longer than usual. Please try again.' );
		case 'connection_not_found':
		case 'not_found':
			return t( 'This Bluesky connection no longer exists.' );
		case 'target_unavailable':
			return t( 'This post is no longer available.' );
		case 'invalid_handle':
		case 'unknown':
			return t( 'Something went wrong. Please try again.' );
		default:
			// Compile-time exhaustiveness: if `AtmosphereError['kind']` ever
			// gains a new value, this fails to type-check.
			err satisfies never;
			// Runtime fallback: a backend-introduced kind shouldn't crash
			// the modal — show generic copy instead.
			return t( 'Something went wrong. Please try again.' );
	}
}

function successNoticeFor(
	mode: ActiveMode,
	result: CreatePostResult,
	t: ReturnType< typeof useTranslate >
): { text: ReactNode; threadUrl: string | null } {
	if ( mode.kind === 'reply' ) {
		return {
			text: t( 'Your reply was posted.' ),
			threadUrl: getThreadUrl( mode.connectionId, mode.parent.uri ),
		};
	}
	if ( mode.kind === 'quote' ) {
		return {
			text: t( 'Your post was published.' ),
			threadUrl: getThreadUrl( mode.connectionId, result.uri ),
		};
	}
	if ( mode.kind === 'standalone' ) {
		return {
			text: t( 'Your post was published.' ),
			threadUrl: getThreadUrl( mode.connectionId, result.uri ),
		};
	}
	return assertNever( mode );
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled discriminated-union case: ${ JSON.stringify( value ) }` );
}

function DiscardConfirm( props: { onCancel: () => void; onConfirm: () => void } ) {
	const translate = useTranslate();
	return (
		<Modal
			title={ translate( 'Discard draft?' ) as string }
			onRequestClose={ props.onCancel }
			size="small"
			className="atmosphere-composer-discard"
		>
			<p>{ translate( 'Your draft will be lost.' ) }</p>
			<HStack justify="flex-end" spacing={ 2 }>
				<Button variant="tertiary" onClick={ props.onCancel }>
					{ translate( 'Keep editing' ) }
				</Button>
				<Button variant="primary" isDestructive onClick={ props.onConfirm }>
					{ translate( 'Discard' ) }
				</Button>
			</HStack>
		</Modal>
	);
}
