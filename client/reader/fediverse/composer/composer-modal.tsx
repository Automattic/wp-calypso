import './style.scss';
import { useCreateFediverseNoteMutation } from '@automattic/api-queries';
import { Modal, Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { trackFediverseEvent } from '../analytics';
import { ComposerFooter } from './composer-footer';
import { useComposer } from './composer-provider';
import { ComposerTextarea } from './composer-textarea';
import { countGraphemes } from './grapheme-count';

const SOFT_LIMIT = 280;

export function ComposerModal() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { mode, closeComposer } = useComposer();
	const mutation = useCreateFediverseNoteMutation( mode?.connectionId ?? 0 );

	const [ text, setText ] = useState( '' );
	const [ confirmDiscard, setConfirmDiscard ] = useState( false );

	useEffect( () => {
		if ( ! mode ) {
			setText( '' );
			setConfirmDiscard( false );
			mutation.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ mode ] );

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
		if ( ! mode || mutation.isPending || graphemeCount === 0 ) {
			return;
		}
		mutation.mutate(
			{ connectionId: mode.connectionId, text },
			{
				onSuccess: () => {
					dispatch( trackFediverseEvent( 'NOTE_POSTED', { connection_id: mode.connectionId } ) );
					dispatch( successNotice( translate( 'Posted to the Fediverse' ) ) );
					closeComposer();
				},
				onError: ( err: unknown ) => {
					const errorCode =
						err && typeof err === 'object' && 'kind' in err
							? String( ( err as { kind: string } ).kind )
							: 'unknown';
					dispatch(
						trackFediverseEvent( 'NOTE_FAILED', {
							connection_id: mode.connectionId,
							error: errorCode,
						} )
					);
				},
			}
		);
	}, [ mode, mutation, text, graphemeCount, closeComposer, dispatch, translate ] );

	if ( ! mode ) {
		return null;
	}

	const errorMessage = mutation.isError ? errorMessageFor( mutation.error, translate ) : null;

	return (
		<>
			<Modal
				title={ translate( 'New Note' ) as string }
				onRequestClose={ handleClose }
				className="fediverse-composer"
				focusOnMount
				size="medium"
			>
				<ComposerTextarea
					value={ text }
					onChange={ setText }
					onSubmit={ handleSubmit }
					placeholder={ translate( "What's happening?" ) as string }
					disabled={ mutation.isPending }
					aria-label={ translate( 'New Note' ) as string }
					aria-describedby={
						errorMessage
							? 'fediverse-composer-error fediverse-composer-count'
							: 'fediverse-composer-count'
					}
					aria-invalid={ errorMessage ? true : undefined }
				/>
				{ errorMessage && (
					<div id="fediverse-composer-error" className="fediverse-composer__error" role="alert">
						{ errorMessage }
					</div>
				) }
				<ComposerFooter
					graphemeCount={ graphemeCount }
					onSubmit={ handleSubmit }
					isPending={ mutation.isPending }
					softLimit={ SOFT_LIMIT }
				/>
			</Modal>
			{ confirmDiscard && (
				<Modal
					title={ translate( 'Discard draft?' ) as string }
					onRequestClose={ () => setConfirmDiscard( false ) }
					size="small"
					className="fediverse-composer-discard"
				>
					<p>{ translate( 'Your draft will be lost.' ) }</p>
					<HStack justify="flex-end" spacing={ 2 }>
						<Button variant="tertiary" onClick={ () => setConfirmDiscard( false ) }>
							{ translate( 'Keep editing' ) }
						</Button>
						<Button
							variant="primary"
							isDestructive
							onClick={ () => {
								setConfirmDiscard( false );
								closeComposer();
							} }
						>
							{ translate( 'Discard' ) }
						</Button>
					</HStack>
				</Modal>
			) }
		</>
	);
}

function errorMessageFor( err: unknown, t: ReturnType< typeof useTranslate > ): string {
	if ( ! err || typeof err !== 'object' || ! ( 'kind' in err ) ) {
		return t( 'Something went wrong. Please try again.' ) as string;
	}
	const kind = ( err as { kind: string } ).kind;
	switch ( kind ) {
		case 'note_empty':
			return t( "We couldn't post an empty Note." ) as string;
		case 'auth_required':
		case 'auth_failed':
			return t( 'Your Fediverse connection needs to be reconnected.' ) as string;
		case 'rate_limited':
			return t( "You're posting too quickly. Try again in a moment." ) as string;
		case 'upstream_unavailable':
			return t( 'The Fediverse site is taking longer than usual. Please try again.' ) as string;
		case 'forbidden':
			return t( "You don't have permission to post on this site." ) as string;
		default:
			return t( 'Something went wrong. Please try again.' ) as string;
	}
}
