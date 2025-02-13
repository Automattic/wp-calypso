import { Dialog, Gridicon, ExternalLink } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import ServerCredentialsForm from 'calypso/components/jetpack/server-credentials-form';
import { useSelector } from 'calypso/state';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	onCloseDialog: ( action?: string ) => void;
	showDialog: boolean;
	skipServerCredentials?: boolean;
	isSingular?: boolean;
	children: ReactNode;
	buttons?: ReactElement[];
	baseDialogClassName?: string;
	title: TranslateResult;
	titleClassName?: string;
}

const ServerCredentialsWizardDialog = ( {
	onCloseDialog,
	showDialog,
	skipServerCredentials = false,
	isSingular = true,
	buttons,
	title,
	titleClassName,
	baseDialogClassName,
	children,
}: Props ) => {
	const siteId = useSelector( getSelectedSiteId );
	const userNeedsCredentials = useSelector( ( state ) => {
		const creds = getJetpackCredentials( state, siteId, 'main' );
		return ! creds || Object.keys( creds ).length === 0;
	} );

	const showServerCredentialsForm = useMemo(
		() => userNeedsCredentials && ! skipServerCredentials,
		[ skipServerCredentials, userNeedsCredentials ]
	);

	return (
		<Dialog
			additionalClassNames={ clsx( 'server-credentials-wizard-dialog', baseDialogClassName ) }
			isVisible={ showDialog }
			buttons={ showServerCredentialsForm ? undefined : buttons }
			onClose={ onCloseDialog }
		>
			<h1 className={ clsx( 'server-credentials-wizard-dialog__header', titleClassName ) }>
				{ title }
			</h1>
			{ showServerCredentialsForm && (
				<>
					<h3 className="server-credentials-wizard-dialog__subheader">
						{ isSingular
							? translate( 'You have selected to fix a discovered threat' )
							: translate( 'You have selected to fix all discovered threats' ) }
					</h3>
					<div className="server-credentials-wizard-dialog__warning">
						<Gridicon
							className="server-credentials-wizard-dialog__icon server-credentials-wizard-dialog__icon--warning"
							icon="info"
							size={ 36 }
						/>
						<p className="server-credentials-wizard-dialog__warning-message">
							{ isSingular
								? translate(
										"Jetpack is unable to auto fix this threat as we currently do not have access to your website's server. Please supply your SFTP/SSH credentials to enable auto fixing. Alternatively, you will need go back and {{strong}}fix the threat manually{{/strong}}.",
										{
											components: {
												strong: <strong />,
											},
										}
								  )
								: translate(
										"Jetpack is unable to auto fix these threats as we currently do not have access to your website's server. Please supply your SFTP/SSH credentials to enable auto fixing. Alternatively, you will need go back and {{strong}}fix the threats manually{{/strong}}.",
										{
											components: {
												strong: <strong />,
											},
										}
								  ) }
							<br />
						</p>
					</div>
					<ExternalLink
						className="server-credentials-wizard-dialog__link-external"
						icon
						href="https://jetpack.com/support/adding-credentials-to-jetpack/"
					>
						{ translate( 'Need help? Find your server credentials' ) }
					</ExternalLink>
					<ServerCredentialsForm
						onCancel={ onCloseDialog }
						role="main"
						siteId={ siteId }
						labels={ {
							cancel: translate( 'Go back' ),
							save: translate( 'Save credentials and fix' ),
						} }
					/>
				</>
			) }
			{ ! showServerCredentialsForm && children }
		</Dialog>
	);
};

export default ServerCredentialsWizardDialog;
