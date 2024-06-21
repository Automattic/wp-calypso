import { HelpCenter, MigrationStatusError } from '@automattic/data-stores';
import {
	useChatStatus,
	useChatWidget,
	useCanConnectToZendesk,
	useMessagingAvailability,
} from '@automattic/help-center/src/hooks';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { HintAdministratorRole } from './hint-administrator-role';
import { HintBackupFail } from './hint-backup-fail';
import { HintIncompatiblePlugins } from './hint-incompatible-plugins';
import { HintJetpackConnection } from './hint-jetpack-connection';
import { HintJetpackUpdate } from './hint-jetpack-update';
import { HintMigrationPluginUpdate } from './hint-migration-plugin-update';
import useErrorDetails from './use-error-details';
import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

interface Props {
	sourceSiteUrl: string;
	targetSiteUrl: string;
	status: MigrationStatusError | null;
	resetMigration: () => void;
	goToImportCapturePage: () => void;
	goToImportContentOnlyPage: () => void;
}

export const MigrationError = ( props: Props ) => {
	const { setShowHelpCenter, setInitialRoute } = useDataStoreDispatch( HELP_CENTER_STORE );
	const {
		sourceSiteUrl,
		targetSiteUrl,
		status,
		resetMigration,
		goToImportCapturePage,
		goToImportContentOnlyPage,
	} = props;
	const translate = useTranslate();
	const { isEligibleForChat } = useChatStatus();
	const { data: canConnectToZendesk } = useCanConnectToZendesk();
	const { data: isMessagingAvailable } = useMessagingAvailability(
		'wpcom_messaging',
		isEligibleForChat
	);
	const { openChatWidget, isOpeningChatWidget } = useChatWidget(
		'zendesk_support_chat_key',
		isEligibleForChat
	);
	const { title, subTitle, hintId, goBackCta, getHelpCta, tryAgainCta, importContentCta } =
		useErrorDetails( status, sourceSiteUrl, targetSiteUrl );

	const getHelp = useCallback( () => {
		if ( isMessagingAvailable && canConnectToZendesk ) {
			openChatWidget( {
				siteUrl: targetSiteUrl,
				message: `${ status }: Import onboarding flow; migration failed`,
			} );
		} else {
			setInitialRoute( '/contact-form?mode=CHAT' );
			setShowHelpCenter( true );
		}
	}, [
		openChatWidget,
		targetSiteUrl,
		status,
		isMessagingAvailable,
		canConnectToZendesk,
		setInitialRoute,
		setShowHelpCenter,
	] );

	return (
		<div className="import__heading import__heading-center">
			<Title className="migration-error--title">{ title }</Title>

			{ !! subTitle && <SubTitle className="migration-error--subtitle">{ subTitle }</SubTitle> }

			{ hintId === 'backup-fail' && <HintBackupFail sourceSiteUrl={ sourceSiteUrl } /> }
			{ hintId === 'incompatible-plugins' && <HintIncompatiblePlugins /> }
			{ hintId === 'jetpack-update' && <HintJetpackUpdate sourceSiteSlug={ sourceSiteUrl } /> }
			{ hintId === 'jetpack-connection' && (
				<HintJetpackConnection sourceSiteUrl={ sourceSiteUrl } targetSiteUrl={ targetSiteUrl } />
			) }
			{ hintId === 'administrator-role' && (
				<HintAdministratorRole sourceSiteUrl={ sourceSiteUrl } targetSiteUrl={ targetSiteUrl } />
			) }
			{ hintId === 'migration-plugin-update' && (
				<HintMigrationPluginUpdate sourceSiteSlug={ sourceSiteUrl } />
			) }

			{ ( goBackCta || tryAgainCta || getHelpCta || importContentCta ) && (
				<div className="import__buttons-group">
					{ importContentCta && (
						<NextButton onClick={ goToImportContentOnlyPage }>
							{ translate( 'Start a ‘Content only’ import' ) }
						</NextButton>
					) }
					{ goBackCta && (
						<NextButton onClick={ goToImportCapturePage }>{ translate( 'Go back' ) }</NextButton>
					) }
					{ tryAgainCta && (
						<NextButton onClick={ resetMigration }>{ translate( 'Try again' ) }</NextButton>
					) }
					{ getHelpCta && (
						<NextButton
							onClick={ getHelp }
							variant={ goBackCta || tryAgainCta || importContentCta ? 'secondary' : 'primary' }
							isBusy={ isOpeningChatWidget }
						>
							{ translate( 'Contact support' ) }
						</NextButton>
					) }
				</div>
			) }
		</div>
	);
};

export default MigrationError;
