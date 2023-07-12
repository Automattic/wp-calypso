import React, { useCallback } from 'react';
import acceptDialog from 'calypso/lib/accept';
import { PluginActions } from './types';
import useGetDialogText from './use-get-dialog-text';
import type { Site, Plugin } from './types';
import type { TranslateResult } from 'i18n-calypso';

type DialogMessageProps = {
	heading: TranslateResult;
	message: TranslateResult;
};
const DialogMessage: React.FC< DialogMessageProps > = ( { heading, message } ) => (
	<div>
		<div className="plugins__confirmation-modal-heading">{ heading }</div>
		<span className="plugins__confirmation-modal-desc">{ message }</span>
	</div>
);

type DialogCallback = ( accepted: boolean ) => void;
const useShowPluginActionDialog = () => {
	const getDialogText = useGetDialogText();

	return useCallback(
		( action: string, plugins: Plugin[], sites: Site[], callback: DialogCallback ) => {
			const dialogOptions = {
				additionalClassNames: 'plugins__confirmation-modal',
				...( action === PluginActions.REMOVE && { isScary: true } ),
			};

			const { heading, message } = getDialogText( action, plugins, sites );
			acceptDialog(
				<DialogMessage heading={ heading } message={ message } />,
				callback,
				heading,
				null,
				dialogOptions
			);
		},
		[ getDialogText ]
	);
};

// For use in situations where hooks aren't supported :-(
export const withShowPluginActionDialog = ( Component: React.Component ) => ( props ) => {
	const showPluginActionDialog = useShowPluginActionDialog();
	return <Component showPluginActionDialog={ showPluginActionDialog } { ...props } />;
};

export default useShowPluginActionDialog;
