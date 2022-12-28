import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useUpdateMonitorSettingsMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-update-monitor-settings-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

export function useToggleActivateMonitor( {
	blog_id: siteId,
	url: siteUrl,
}: {
	blog_id: number;
	url: string;
} ): [ ( isEnabled: boolean ) => void, boolean ] {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const components = {
		em: <em />,
	};

	const toggleActivateMonitoring = useUpdateMonitorSettingsMutation( {
		onSuccess: ( _data, arg ) => {
			const isEnabled = arg.params.monitor_active;
			const status = isEnabled ? translate( 'activate' ) : translate( 'deactivate' );
			const successMessage = translate(
				'A request to %(status)s the monitor for {{em}}%(siteUrl)s{{/em}} was made successfully. ' +
					'Please allow a few minutes for it to %(status)s.',
				{
					args: { status, siteUrl },
					comment:
						"%(status)s is the monitor's currently set activation status which could be either 'activate' or 'deactivate'",
					components,
				}
			);
			dispatch( successNotice( successMessage ) );
		},
		onError: ( _error, arg ) => {
			const isEnabled = arg.params.monitor_active;
			const status = isEnabled ? translate( 'activate' ) : translate( 'deactivate' );
			const errorMessage = translate(
				'Sorry, something went wrong when trying to %(status)s monitor for {{em}}%(siteUrl)s{{/em}}. Please try again.',
				{
					args: { status, siteUrl },
					comment:
						"%(status)s is the monitor's currently set activation status which could be either 'activate' or 'deactivate'",
					components,
				}
			);
			dispatch( errorNotice( errorMessage, { isPersistent: true } ) );
		},
		retry: ( errorCount ) => {
			return errorCount < 3;
		},
	} );

	const toggle = useCallback(
		( isEnabled: boolean ) => {
			const params = {
				monitor_active: isEnabled,
			};
			toggleActivateMonitoring.mutate( { siteId, params } );
		},
		[ siteId, toggleActivateMonitoring ]
	);

	return [ toggle, toggleActivateMonitoring.isLoading ];
}
