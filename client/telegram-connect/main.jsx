import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Loading from 'calypso/components/loading';
import { useInterval } from 'calypso/lib/interval';
import wpcom from 'calypso/lib/wp';
import { TELEGRAM_TRANSIENT_NOTICE } from 'calypso/me/telegram/use-telegram-bot-widget';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import './style.scss';

const DEVELOPER_PATH = '/me/developer';

function TelegramConnectMessageLayout( { documentTitle, title, children } ) {
	return (
		<>
			<DocumentHead title={ documentTitle } />
			<div className="wpcom__loading telegram-connect__wpcom-loading">
				<h1 className="wpcom__loading-title">{ title }</h1>
				<div className="telegram-connect__action">{ children }</div>
			</div>
		</>
	);
}

export default function TelegramConnectPage( { telegramId, token, ts } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ status, setStatus ] = useState( 'loading' ); // 'loading' | 'success' | 'error' | 'missing_params'

	const [ tick, setTick ] = useState( 0 );
	const [ hasStarted, setHasStarted ] = useState( false );

	useEffect( () => {
		const id = setTimeout( () => setHasStarted( true ), 750 );
		return () => clearTimeout( id );
	}, [] );

	const showProgress = status === 'loading' || status === 'success';

	useInterval(
		() => setTick( ( t ) => t + 1 ),
		showProgress && hasStarted && status === 'loading' ? 400 : null
	);

	let progressValue = 10;
	if ( status === 'success' ) {
		progressValue = 100;
	} else if ( hasStarted ) {
		progressValue = Math.min( 95, 10 + tick * 2 );
	}

	useEffect( () => {
		if ( ! telegramId || ! token || ! ts ) {
			setStatus( 'missing_params' );
			return;
		}

		wpcom.req
			.post(
				{ path: '/telegram-bot/connect-via-token', apiNamespace: 'wpcom/v2' },
				{ telegram_id: telegramId, token, ts }
			)
			.then( () => {
				recordTracksEvent( 'calypso_telegram_connect_via_token_success', {
					source: 'calypso_token',
				} );
				dispatch(
					successNotice(
						translate( 'Telegram connected successfully.' ),
						TELEGRAM_TRANSIENT_NOTICE
					)
				);
				setStatus( 'success' );
				page.redirect( DEVELOPER_PATH );
			} )
			.catch( ( err ) => {
				recordTracksEvent( 'calypso_telegram_connect_via_token_error', {
					source: 'calypso_token',
					error: err?.message || 'unknown',
				} );
				dispatch(
					errorNotice(
						err?.message || translate( 'Failed to connect Telegram. Please try again.' ),
						TELEGRAM_TRANSIENT_NOTICE
					)
				);
				setStatus( 'error' );
			} );
	}, [ telegramId, token, ts, dispatch, translate ] );

	if ( status === 'missing_params' ) {
		const title = translate( 'Invalid link. Missing Telegram connection parameters.' );
		return (
			<TelegramConnectMessageLayout documentTitle={ title } title={ title }>
				<Button primary href={ DEVELOPER_PATH }>
					{ translate( 'Go to Developer Features' ) }
				</Button>
			</TelegramConnectMessageLayout>
		);
	}

	if ( status === 'error' ) {
		const title = translate(
			'Could not connect your Telegram account. Please try again from Developer Features.'
		);
		return (
			<TelegramConnectMessageLayout documentTitle={ title } title={ title }>
				<Button primary href={ DEVELOPER_PATH }>
					{ translate( 'Go to Developer Features' ) }
				</Button>
			</TelegramConnectMessageLayout>
		);
	}

	return (
		<>
			<DocumentHead title={ translate( 'Connecting your Telegram account' ) } />
			<Loading
				title={ translate( 'Connecting your Telegram account' ) }
				progress={ progressValue }
			/>
		</>
	);
}
