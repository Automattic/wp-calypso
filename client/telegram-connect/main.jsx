import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const DEVELOPER_PATH = '/me/developer';

export default function TelegramConnectPage( { telegramId, token, ts } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ status, setStatus ] = useState( 'loading' ); // 'loading' | 'success' | 'error' | 'missing_params'

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
				dispatch( successNotice( translate( 'Telegram connected successfully.' ) ) );
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
						err?.message || translate( 'Failed to connect Telegram. Please try again.' )
					)
				);
				setStatus( 'error' );
			} );
	}, [ telegramId, token, ts, dispatch, translate ] );

	if ( status === 'missing_params' ) {
		return (
			<Card className="telegram-connect-page">
				<p>{ translate( 'Invalid link. Missing Telegram connection parameters.' ) }</p>
				<Button href={ DEVELOPER_PATH }>{ translate( 'Go to Developer Features' ) }</Button>
			</Card>
		);
	}

	if ( status === 'error' ) {
		return (
			<Card className="telegram-connect-page">
				<p>
					{ translate(
						'Could not connect your Telegram account. Please try again from Developer Features.'
					) }
				</p>
				<Button href={ DEVELOPER_PATH }>{ translate( 'Go to Developer Features' ) }</Button>
			</Card>
		);
	}

	// loading or success (redirect in flight)
	return (
		<Card className="telegram-connect-page">
			<p>{ translate( 'Connecting your Telegram account…' ) }</p>
		</Card>
	);
}
