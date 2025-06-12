import { Dialog } from '@automattic/components';
import clsx from 'clsx';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	onCloseDialog: ( action?: string ) => void;
	showDialog: boolean;
	children: ReactNode;
	buttons?: ReactElement[];
	baseDialogClassName?: string;
	title: TranslateResult;
	titleClassName?: string;
}

const ServerCredentialsWizardDialog = ( {
	onCloseDialog,
	showDialog,
	buttons,
	title,
	titleClassName,
	baseDialogClassName,
	children,
}: Props ) => {
	return (
		<Dialog
			additionalClassNames={ clsx( 'server-credentials-wizard-dialog', baseDialogClassName ) }
			isVisible={ showDialog }
			buttons={ buttons }
			onClose={ onCloseDialog }
		>
			<h1 className={ clsx( 'server-credentials-wizard-dialog__header', titleClassName ) }>
				{ title }
			</h1>
			{ children }
		</Dialog>
	);
};

export default ServerCredentialsWizardDialog;
