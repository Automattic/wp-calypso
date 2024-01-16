import { useChatWidget } from '@automattic/help-center/src/hooks';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';

interface Props {
	siteUrl: string;
	resetMigration: () => void;
}
export default function MigrationError( props: Props ) {
	const translate = useTranslate();
	const { openChatWidget } = useChatWidget();
	const { siteUrl, resetMigration } = props;

	useEffect( () => {
		openChatWidget( {
			message: 'Import onboarding flow: migration failed',
			siteUrl: siteUrl,
		} );
	}, [] );

	return (
		<>
			<div className="import-layout__center">
				<div>
					<div className="import__heading import__heading-center">
						<Title>{ translate( 'Import failed' ) }</Title>
						<SubTitle>
							{ translate( 'There was an error with your import.' ) }
							<br />
							{ translate( 'Please try again soon or contact support for help.' ) }
						</SubTitle>
						<div className="import__buttons-group">
							<NextButton onClick={ resetMigration }>{ translate( 'Try again' ) }</NextButton>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
