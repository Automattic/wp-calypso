import './style.scss';
import { createPostMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { ComposerFooter } from './composer-footer';
import { ComposerPinnedContext } from './composer-pinned-context';
import { useComposer, type ActiveMode } from './composer-provider';
import { ComposerTextarea } from './composer-textarea';
import { countGraphemes } from './grapheme-count';
import type { AtmosphereError, CreatePostParams } from '@automattic/api-core';
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
		}
		// quote / standalone Tracks events are emitted by later slices.
	}, [ mode, dispatch ] );

	// Tracks: error_shown with ref-tracked dedupe per error_kind transition.
	useEffect( () => {
		if ( ! mode || mode.kind !== 'reply' ) {
			return;
		}
		if ( mutation.isError && mutation.error ) {
			const errorKind = ( mutation.error as AtmosphereError ).kind;
			if ( errorKind !== lastErrorKindRef.current ) {
				lastErrorKindRef.current = errorKind;
				dispatch(
					recordReaderTracksEvent( 'calypso_reader_atmosphere_reply_error_shown', {
						connection_id: mode.connectionId,
						parent_uri: mode.parent.uri,
						error_kind: errorKind,
					} )
				);
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
		const params = buildParamsForMode( mode, text );
		mutation.mutate( params, {
			onSuccess: () => {
				if ( mode.kind === 'reply' ) {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_atmosphere_reply_published', {
							connection_id: mode.connectionId,
							parent_uri: mode.parent.uri,
							root_uri: mode.root.uri,
						} )
					);
				}
				closeComposer();
			},
		} );
	}, [ mode, mutation, text, closeComposer, dispatch ] );

	if ( ! mode ) {
		return null;
	}

	const handle =
		mode.kind === 'reply' || mode.kind === 'quote' ? mode.previewPost.author.handle : undefined;

	const title = titleForMode( mode, translate );
	const placeholder = placeholderForMode( mode, translate, handle );
	const errorMessage = mutation.isError
		? errorMessageFor( mutation.error as AtmosphereError, translate )
		: null;

	return (
		<>
			<Modal
				title={ title }
				onRequestClose={ handleClose }
				className="atmosphere-composer"
				focusOnMount
			>
				<ComposerPinnedContext mode={ mode } />
				<ComposerTextarea
					value={ text }
					onChange={ setText }
					onSubmit={ handleSubmit }
					placeholder={ placeholder }
					disabled={ mutation.isPending }
					aria-describedby="atmosphere-composer-count"
				/>
				{ errorMessage && (
					<div className="atmosphere-composer__error" role="alert">
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
		return t( 'Replying to @%(handle)s…', { args: { handle: handle ?? '' } } ) as string;
	}
	if ( mode.kind === 'quote' ) {
		return t( 'Add a comment…' ) as string;
	}
	return t( "What's up?" ) as string;
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
			return t( "We couldn't post this. Try shortening your post." );
		case 'auth_required':
			return (
				<>
					{ t( 'Your Bluesky connection needs to be reconnected.' ) }{ ' ' }
					<a href="/reader/atmosphere/connect" target="_blank" rel="noopener noreferrer">
						{ t( 'Reconnect' ) }
					</a>
				</>
			);
		case 'rate_limited':
			return t( "You're posting too quickly. Try again in a moment." );
		case 'upstream_unavailable':
			return t( 'Bluesky is taking longer than usual. Please try again.' );
		default:
			return t( 'Something went wrong. Please try again.' );
	}
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
