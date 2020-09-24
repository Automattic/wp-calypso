/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

enum StatusState {
	Disconnected,
	Connected,
	Connecting,
	Failed,
	Loading,
}

interface Props {
	state: StatusState;
}

const ConnectionStatus: FunctionComponent< Props > = ( { state } ) => {
	const translate = useTranslate();

	const getClass = () => {
		switch ( state ) {
			case StatusState.Failed:
				return 'top__connection-status-failed';
			case StatusState.Connected:
				return 'top__connection-status-connected';
			case StatusState.Connecting:
				return 'top__connection-status-connecting';
			case StatusState.Disconnected:
				return 'top__connection-status-disconnected';
			case StatusState.Loading:
				return 'top__connection-status-loading';
		}
	};

	const getText = () => {
		switch ( state ) {
			case StatusState.Failed:
				return translate( 'Connection failed' );
			case StatusState.Connected:
				return translate( 'Connected' );
			case StatusState.Connecting:
				return translate( 'Connecting' );
			case StatusState.Disconnected:
				return translate( 'Disconnected' );
			case StatusState.Loading:
				return translate( 'Loading' );
		}
	};

	return (
		<div className={ getClass() }>
			<span>{ getText() }</span>
			<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<circle cx="50" cy="50" r="50" />
			</svg>
		</div>
	);
};

export { ConnectionStatus, StatusState };
