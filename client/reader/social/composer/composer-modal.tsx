import './style.scss';

import page from '@automattic/calypso-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { useComposerConfig } from './composer-config';
import { ComposerFooter } from './composer-footer';
import { ComposerPinnedContext } from './composer-pinned-context';
import { useComposer } from './composer-provider';
import { ComposerTextarea } from './composer-textarea';
import { countGraphemes } from './grapheme-count';
import type { AppState } from 'calypso/types';

export function ComposerModal< TError, TParams, TResult >() {
	const translate = useTranslate();
	const config = useComposerConfig< TError, TParams, TResult >();
	const { mode, closeComposer, mediaSlot } = useComposer();
	const queryClient = useQueryClient();
	const mutation = useMutation( config.mutationFactory( queryClient ) );
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();

	const [ text, setText ] = useState( '' );
	const [ confirmDiscard, setConfirmDiscard ] = useState( false );
	const lastErrorSignatureRef = useRef< string | null >( null );

	useEffect( () => {
		if ( ! mode ) {
			setText( '' );
			setConfirmDiscard( false );
			mutation.reset();
			lastErrorSignatureRef.current = null;
		}
		// mutation.reset is stable across renders; intentionally not in deps.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ mode ] );

	useEffect( () => {
		if ( ! mode ) {
			return;
		}
		const { event, props } = config.tracks.opened( mode );
		dispatch( recordReaderTracksEvent( event, props ) );
	}, [ mode, dispatch, config.tracks ] );

	useEffect( () => {
		if ( ! mode ) {
			return;
		}
		if ( mutation.isError && mutation.error ) {
			// Dedup on a JSON signature so distinct kinds-with-payload
			// (e.g. rate_limited/30 vs rate_limited/60) refire the event.
			const signature = JSON.stringify( mutation.error );
			if ( signature !== lastErrorSignatureRef.current ) {
				lastErrorSignatureRef.current = signature;
				config.logBadRequest?.( mode, mutation.error );
				const { event, props } = config.tracks.errorShown( mode, mutation.error );
				dispatch( recordReaderTracksEvent( event, props ) );
			}
		} else if ( ! mutation.isError ) {
			lastErrorSignatureRef.current = null;
		}
	}, [ mutation.isError, mutation.error, mode, dispatch, config ] );

	const graphemeCount = useMemo( () => countGraphemes( text ), [ text ] );

	const handleClose = useCallback( () => {
		if ( mutation.isPending ) {
			return;
		}
		if ( text.trim().length > 0 || mediaSlot.hasAny ) {
			setConfirmDiscard( true );
			return;
		}
		closeComposer();
	}, [ mutation.isPending, text, mediaSlot.hasAny, closeComposer ] );

	const tooLong = graphemeCount > config.limit;
	const empty = graphemeCount === 0;
	// Image-only posts are allowed: when the user has at least one uploaded
	// image, the empty-text gate doesn't block submission. Pending media (any
	// image still compressing/uploading) blocks regardless.
	const canSubmit =
		! mutation.isPending &&
		! tooLong &&
		! mediaSlot.isAnyPending &&
		mediaSlot.isAllUploaded &&
		( ! empty || mediaSlot.hasUploaded );

	const handleSubmit = useCallback( () => {
		if ( ! mode || mutation.isPending ) {
			return;
		}
		if ( ! canSubmit ) {
			return;
		}
		const baseParams = config.buildParams( mode, text );
		const params = mediaSlot.extendBuildParams( baseParams ) as TParams;
		mutation.mutate( params, {
			onSuccess: ( result ) => {
				mediaSlot.onPublishSuccess( queryClient, result );
				const { event, props } = config.tracks.published( mode, result );
				dispatch( recordReaderTracksEvent( event, props ) );
				const { text: noticeText, threadUrl } = config.successNotice( mode, result, translate );
				const options = threadUrl
					? { button: translate( 'View' ) as string, onClick: () => page( threadUrl ) }
					: undefined;
				dispatch( successNotice( noticeText, options ) );
				closeComposer( { keepPreviewUrlsAlive: mediaSlot.hasUploaded } );
			},
		} );
	}, [
		mode,
		mutation,
		text,
		canSubmit,
		closeComposer,
		dispatch,
		translate,
		config,
		mediaSlot,
		queryClient,
	] );

	if ( ! mode ) {
		return null;
	}

	const handle =
		mode.kind === 'reply' || mode.kind === 'quote' ? mode.previewPost.author.handle : undefined;

	const title = config.copy.title( mode, translate );
	const placeholder = config.copy.placeholder( mode, translate, handle );
	const errorMessage =
		mutation.isError && mutation.error ? config.errorMessage( mutation.error, translate ) : null;

	return (
		<>
			<Modal
				title={ title }
				onRequestClose={ handleClose }
				className="social-composer"
				focusOnMount
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
					aria-describedby={
						errorMessage ? 'social-composer-error social-composer-count' : 'social-composer-count'
					}
					aria-invalid={ errorMessage ? true : undefined }
				/>
				{ mediaSlot.renderGrid() }
				{ errorMessage && (
					<div id="social-composer-error" className="social-composer__error" role="alert">
						{ errorMessage }
					</div>
				) }
				<ComposerFooter
					graphemeCount={ graphemeCount }
					onSubmit={ handleSubmit }
					isPending={ mutation.isPending }
					limit={ config.limit }
					disabled={ ! canSubmit }
					footerStart={ mediaSlot.renderFooterTrigger() }
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

function DiscardConfirm( props: { onCancel: () => void; onConfirm: () => void } ) {
	const translate = useTranslate();
	return (
		<Modal
			title={ translate( 'Discard draft?' ) as string }
			onRequestClose={ props.onCancel }
			size="small"
			className="social-composer-discard"
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
