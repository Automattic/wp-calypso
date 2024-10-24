import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import missingCredentialsIcon from 'calypso/components/jetpack/daily-backup-status/missing-credentials.svg';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';

type CredentialsPromptProps = {
	siteSlug: string;
};

const CredentialsPrompt: FunctionComponent< CredentialsPromptProps > = ( { siteSlug } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onClick = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_actions_credentials_click' ) );
	};

	return (
		<div className="toolbar__credentials-warning">
			<img src={ missingCredentialsIcon } alt="" role="presentation" />
			<div className="toolbar__credentials-warning-text">
				{ translate(
					'{{a}}Enter your server credentials{{/a}} to enable one-click restores from your backups.',
					{
						components: {
							a: <a href={ settingsPath( siteSlug ) } onClick={ onClick } />,
						},
					}
				) }
			</div>
		</div>
	);
};

export default CredentialsPrompt;
