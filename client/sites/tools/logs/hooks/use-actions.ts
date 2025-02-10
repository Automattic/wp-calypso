import { copy } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { LogType, ServerLog, PHPLog } from 'calypso/data/hosting/use-site-logs-query';

const useActions = ( { logType }: { logType: LogType } ) => {
	const { __ } = useI18n();
	const actions = useMemo( () => {
		if ( logType === 'php' ) {
			return [
				{
					id: 'copy-msg',
					label: __( 'Copy message' ),
					icon: copy,
					isPrimary: true,
					supportsBulk: false,
					callback: ( items: PHPLog[] ) => {
						const message = items[ 0 ].message;
						navigator.clipboard.writeText( message );
					},
				},
			];
		}

		return [
			{
				id: 'copy-url',
				label: __( 'Copy Request URL' ),
				icon: copy,
				isPrimary: true,
				supportsBulk: false,
				callback: ( items: ServerLog[] ) => {
					const url = items[ 0 ].request_url;
					navigator.clipboard.writeText( url );
				},
			},
		];
	}, [ logType, __ ] );

	return actions;
};

export default useActions;
