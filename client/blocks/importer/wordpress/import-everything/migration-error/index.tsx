import { MigrationStatusError } from '@automattic/data-stores';
import { useChatWidget } from '@automattic/help-center/src/hooks';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { HintIncompatiblePlugins } from './hint-incompatible-plugins';
import { HintJetpackUpdate } from './hint-jetpack-update';
import useErrorDetails from './use-error-details';
import './style.scss';

interface Props {
	sourceSiteUrl: string;
	targetSiteUrl: string;
	status: MigrationStatusError | null;
	resetMigration: () => void;
}
export const MigrationError = ( props: Props ) => {
	const { sourceSiteUrl, targetSiteUrl, status, resetMigration } = props;
	const translate = useTranslate();
	const { openChatWidget, isOpeningChatWidget } = useChatWidget();
	const { title, subTitle, hintId, goBackCta, getHelpCta, tryAgainCta } = useErrorDetails( status );

	const getHelp = useCallback( () => {
		openChatWidget( {
			siteUrl: targetSiteUrl,
			message: 'Import onboarding flow: migration failed',
		} );
	}, [ openChatWidget, targetSiteUrl ] );

	const goBack = useCallback( () => {
		// go back the capture screen
	}, [] );

	return (
		<div className="import__heading import__heading-center">
			<Title className="migration-error--title">{ title }</Title>

			{ !! subTitle && <SubTitle>{ subTitle }</SubTitle> }

			{ hintId === 'jetpack-update' && <HintJetpackUpdate sourceSiteSlug={ sourceSiteUrl } /> }
			{ hintId === 'incompatible-plugins' && <HintIncompatiblePlugins /> }

			{ ( goBackCta || tryAgainCta || getHelpCta ) && (
				<div className="import__buttons-group">
					{ goBackCta && <NextButton onClick={ goBack }>{ translate( 'Go back' ) }</NextButton> }
					{ tryAgainCta && (
						<NextButton onClick={ resetMigration }>{ translate( 'Try again' ) }</NextButton>
					) }
					{ getHelpCta && (
						<NextButton
							onClick={ getHelp }
							variant={ goBackCta || tryAgainCta ? 'secondary' : 'primary' }
							isBusy={ isOpeningChatWidget }
						>
							{ translate( 'Get help' ) }
						</NextButton>
					) }
				</div>
			) }
		</div>
	);
};

export default MigrationError;
