import { HelpCenter, MigrationStatusError } from '@automattic/data-stores';
import { useChatStatus } from '@automattic/help-center/src/hooks';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import {
	useCanConnectToZendeskMessaging,
	useZendeskMessagingAvailability,
	useOpenZendeskMessaging,
} from '@automattic/zendesk-client';
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
	targetSiteID: string | number;
	status: MigrationStatusError | null;
	resetMigration: () => void;
	goToImportCapturePage: () => void;
	goToImportContentOnlyPage: () => void;
}

export const MigrationError = ( props: Props ) => {
	const { setShowHelpCenter, setNavigateToRoute, resetStore } =
		useDataStoreDispatch( HELP_CENTER_STORE );
	const {
		sourceSiteUrl,
		targetSiteUrl,
		status,
		resetMigration,
		goToImportCapturePage,
		goToImportContentOnlyPage,
		targetSiteID,
	} = props;
	const translate = useTranslate();
	const { isEligibleForChat } = useChatStatus();
	const { data: canConnectToZendeskMessaging } = useCanConnectToZendeskMessaging();
	const { data: isMessagingAvailable } = useZendeskMessagingAvailability(
		'wpcom_messaging',
		isEligibleForChat
	);
	const { openZendeskWidget, isOpeningZendeskWidget } = useOpenZendeskMessaging(
		'migration-error',
		isEligibleForChat
	);
	const { title, subTitle, hintId, goBackCta, getHelpCta, tryAgainCta, importContentCta } =
		useErrorDetails( status, sourceSiteUrl, targetSiteUrl );

	const getHelp = useCallback( () => {
		if ( isMessagingAvailable && canConnectToZendeskMessaging ) {
			openZendeskWidget( {
				siteUrl: targetSiteUrl,
				siteId: targetSiteID,
				message: `${ status }: Import onboarding flow; migration failed`,
				onSuccess: () => {
					resetStore();
					setShowHelpCenter( false );
				},
			} );
		} else {
			setNavigateToRoute( '/contact-form?mode=CHAT' );
			setShowHelpCenter( true );
		}
	}, [
		resetStore,
		openZendeskWidget,
		targetSiteUrl,
		status,
		isMessagingAvailable,
		targetSiteID,
		canConnectToZendeskMessaging,
		setNavigateToRoute,
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
							isBusy={ isOpeningZendeskWidget }
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
