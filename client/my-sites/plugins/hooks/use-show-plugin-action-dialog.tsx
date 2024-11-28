import React, { useCallback } from 'react';
import acceptDialog from 'calypso/lib/accept';
import { PluginActions } from './types';
import useGetDialogText from './use-get-dialog-text';
import type { Site, Plugin } from './types';
import type { TranslateResult } from 'i18n-calypso';

type DialogMessageProps = {
	message: TranslateResult;
};
const DialogMessage: React.FC< DialogMessageProps > = ( { message } ) => <p>{ message }</p>;

type DialogCallback = ( accepted: boolean ) => void;
const useShowPluginActionDialog = () => {
	const getDialogText = useGetDialogText();

	return useCallback(
		( action: string, plugins: Plugin[], sites: Site[], callback: DialogCallback ) => {
			const { heading, message, cta } = getDialogText( action, plugins, sites );

			const dialogOptions = {
				additionalClassNames: 'plugins__confirmation-modal',
				...( action === PluginActions.REMOVE && { isScary: true } ),
				useModal: true,
				modalOptions: {
					title: heading,
				},
			};

			acceptDialog(
				<DialogMessage message={ message } />,
				callback,
				cta?.confirm,
				cta?.cancel,
				dialogOptions
			);
		},
		[ getDialogText ]
	);
};

// For use in situations where hooks aren't supported :-(
export function withShowPluginActionDialog< ComponentProps >(
	Component: React.ComponentType< ComponentProps >
) {
	return ( props: ComponentProps ) => {
		const showPluginActionDialog = useShowPluginActionDialog();
		return <Component showPluginActionDialog={ showPluginActionDialog } { ...props } />;
	};
}

export default useShowPluginActionDialog;
