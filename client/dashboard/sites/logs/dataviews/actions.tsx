import { useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { details } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { LogType, PHPLog, ServerLog } from '../../../data/site-logs';
import DetailsModalPHP from '../components/details-modal-php';
import DetailsModalServer from '../components/details-modal-server';
import type { Action } from '@wordpress/dataviews';

type LogItem = PHPLog | ServerLog;

export interface UseLogActionsOptions {
	logType: LogType;
	isLoading: boolean;
	gmtOffset: number;
	timezoneString?: string;
}

export function useActions( {
	logType,
	isLoading,
	gmtOffset,
	timezoneString,
}: UseLogActionsOptions ): Action< LogItem >[] {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	return useMemo( () => {
		const commonDetailsAction: Action< LogItem > = {
			id: 'details-modal',
			label: __( 'View log details' ),
			modalHeader: __( 'Log details' ),
			isPrimary: true,
			icon: details,
			disabled: isLoading,
			supportsBulk: false,
			RenderModal: ( { items } ) => {
				const item = items[ 0 ];
				return logType === LogType.PHP ? (
					<DetailsModalPHP
						item={ item as PHPLog }
						gmtOffset={ gmtOffset }
						timezoneString={ timezoneString }
					/>
				) : (
					<DetailsModalServer
						item={ item as ServerLog }
						gmtOffset={ gmtOffset }
						timezoneString={ timezoneString }
					/>
				);
			},
		};

		if ( logType === LogType.PHP ) {
			const copyMessageAction: Action< LogItem > = {
				id: 'copy-msg',
				label: __( 'Copy message' ),
				disabled: isLoading,
				supportsBulk: false,
				callback: async ( items ) => {
					const message = ( items[ 0 ] as PHPLog ).message;
					try {
						await navigator.clipboard.writeText( message );
						createSuccessNotice( __( 'Copied message.' ), { type: 'snackbar' } );
					} catch ( e ) {
						createErrorNotice( __( 'Message could not be copied.' ), { type: 'snackbar' } );
					}
				},
			};
			return [ commonDetailsAction, copyMessageAction ];
		}

		const copyUrlAction: Action< LogItem > = {
			id: 'copy-url',
			label: __( 'Copy request URL' ),
			disabled: isLoading,
			supportsBulk: false,
			callback: async ( items ) => {
				const url = ( items[ 0 ] as ServerLog ).request_url;
				try {
					await navigator.clipboard.writeText( url );
					createSuccessNotice( __( 'Copied request URL.' ), { type: 'snackbar' } );
				} catch ( e ) {
					createErrorNotice( __( 'Request URL could not be copied.' ), { type: 'snackbar' } );
				}
			},
		};
		return [ commonDetailsAction, copyUrlAction ];
	}, [ logType, isLoading, gmtOffset, timezoneString, createSuccessNotice, createErrorNotice ] );
}
