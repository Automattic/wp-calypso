import { Modal, Button } from '@wordpress/components';
import React, { useCallback, useState } from 'react';
import { PluginActions } from './types';
import useGetDialogText from './use-get-dialog-text';
import type { Site, Plugin } from './types';
import type { TranslateResult } from 'i18n-calypso';
import './styles.scss';

type DialogMessageProps = {
	message: TranslateResult;
	onConfirm: () => void;
	onCancel: () => void;
	heading?: string;
	confirmText?: string;
	cancelText?: string;
	isScary?: boolean;
};

const PluginActionDialog: React.FC< DialogMessageProps > = ( {
	message,
	onConfirm,
	onCancel,
	heading,
	confirmText,
	cancelText,
	isScary,
} ) => (
	<Modal title={ heading } onRequestClose={ onCancel } className="plugins__confirmation-modal">
		<div className="plugin-action-dialog__content">
			<p>{ message }</p>
			<div className="plugin-action-dialog__buttons">
				<Button variant="secondary" onClick={ onCancel }>
					{ cancelText }
				</Button>
				<Button isDestructive={ isScary } variant="primary" onClick={ onConfirm }>
					{ confirmText }
				</Button>
			</div>
		</div>
	</Modal>
);

const useShowPluginActionDialog = () => {
	const getDialogText = useGetDialogText();
	const [ dialogProps, setDialogProps ] = useState< DialogMessageProps | null >( null );

	const showDialog = useCallback(
		(
			action: string,
			plugins: Plugin[],
			sites: Site[],
			callback: ( accepted: boolean ) => void
		) => {
			const { heading, message, cta } = getDialogText( action, plugins, sites );

			setDialogProps( {
				message,
				heading: heading as string,
				confirmText: cta?.confirm,
				cancelText: cta?.cancel,
				isScary: action === PluginActions.REMOVE,
				onConfirm: () => {
					callback( true );
					setDialogProps( null );
				},
				onCancel: () => {
					callback( false );
					setDialogProps( null );
				},
			} );
		},
		[ getDialogText ]
	);

	return {
		showDialog,
		DialogComponent: dialogProps ? <PluginActionDialog { ...dialogProps } /> : null,
	};
};

// For use in situations where hooks aren't supported :-(
export function withShowPluginActionDialog< ComponentProps >(
	Component: React.ComponentType< ComponentProps >
) {
	return ( props: ComponentProps ) => {
		const { showDialog, DialogComponent } = useShowPluginActionDialog();
		return (
			<>
				<Component showPluginActionDialog={ showDialog } { ...props } />
				{ DialogComponent }
			</>
		);
	};
}

export default useShowPluginActionDialog;
