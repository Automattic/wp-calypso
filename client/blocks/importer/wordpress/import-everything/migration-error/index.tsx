import { MigrationStatusError } from '@automattic/data-stores';
import { useChatWidget } from '@automattic/help-center/src/hooks';
import { localizeUrl } from '@automattic/i18n-utils';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useErrorDetails from './use-error-details';
import './style.scss';

export const MigrationErrorHint = () => {
	const translate = useTranslate();
	const jetpackSupportUrl = localizeUrl(
		'https://jetpack.com/support/getting-started-with-jetpack/'
	);
	const wordPressSupportUrl = localizeUrl(
		'https://wordpress.com/support/invite-people/user-roles/#administrator'
	);

	return (
		<div className="migration-error--hint">
			<p>{ translate( 'To continue, please:' ) }</p>
			<ol>
				<li>
					{ translate(
						'Please ensure the {{a}}Jetpack plugin is active and connected{{/a}} on the source website.',
						{
							components: {
								a: <a href={ jetpackSupportUrl } />,
							},
						}
					) }
				</li>
				<li>
					{ translate(
						'{{a}}Check that your WordPress.com account exists{{/a}} as administrator.',
						{
							components: {
								a: <a href={ wordPressSupportUrl } />,
							},
						}
					) }
				</li>
				<li>{ translate( 'Try again or contact our Happiness Engineers' ) }</li>
			</ol>
		</div>
	);
};

interface Props {
	siteUrl: string;
	status: MigrationStatusError | null;
	resetMigration: () => void;
}
export const MigrationError = ( props: Props ) => {
	const { siteUrl, status, resetMigration } = props;
	const translate = useTranslate();
	const { openChatWidget, isOpeningChatWidget } = useChatWidget();
	const { title, getHelpCta, tryAgainCta } = useErrorDetails( status );

	const getHelp = useCallback( () => {
		openChatWidget( {
			siteUrl: siteUrl,
			message: 'Import onboarding flow: migration failed',
		} );
	}, [ openChatWidget, siteUrl ] );

	return (
		<div className="import__heading import__heading-center">
			<Title>{ translate( "We couldn't complete your migration" ) }</Title>
			<SubTitle>{ title }</SubTitle>
			<div className="import__buttons-group">
				{ tryAgainCta && (
					<NextButton onClick={ resetMigration }>{ translate( 'Try again' ) }</NextButton>
				) }
				{ getHelpCta && (
					<NextButton onClick={ getHelp } variant="secondary" isBusy={ isOpeningChatWidget }>
						{ translate( 'Get help' ) }
					</NextButton>
				) }
			</div>
		</div>
	);
};

export default MigrationError;
