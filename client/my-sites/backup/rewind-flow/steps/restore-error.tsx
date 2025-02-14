import { Button } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import Error from '../error';

interface Props {
	backupDisplayDate: string;
	siteId: number;
	siteSlug: string | null;
	siteUrl: string;
	hasCredentials: boolean;
	canAutoconfigure: boolean;
	onRetryClick: () => void;
	onAddingCredentialsClick: () => void;
	onLearnAddingCredentialsClick: () => void;
}

const RestoreError: FunctionComponent< Props > = ( {
	backupDisplayDate,
	siteId,
	siteSlug,
	siteUrl,
	hasCredentials,
	canAutoconfigure,
	onRetryClick,
	onAddingCredentialsClick,
	onLearnAddingCredentialsClick,
} ) => {
	const translate = useTranslate();

	const ErrorDetails = () => (
		<p className="rewind-flow__info">
			{ translate(
				'An error occurred while restoring your site. Please {{button}}try your restore again{{/button}} or contact our support team to resolve the issue.',
				{
					components: {
						button: <Button className="rewind-flow__error-retry-button" onClick={ onRetryClick } />,
					},
				}
			) }
		</p>
	);

	const ErrorDetailsAddCredentials = () => (
		<>
			<p className="rewind-flow__info">
				{ translate(
					'An error occurred while restoring your site. You may need to {{linkCredentials}}add your server credentials{{/linkCredentials}}. You can follow the steps in {{linkGuide}}our guide{{/linkGuide}} to add SSH, SFTP, or FTP credentials, and then try to restore again.',
					{
						components: {
							linkCredentials: (
								<a
									href={
										canAutoconfigure
											? `/start/rewind-auto-config/?blogid=${ siteId }&siteSlug=${ siteSlug }`
											: `/settings/${ siteSlug }#credentials`
									}
									onClick={ onAddingCredentialsClick }
								/>
							),
							linkGuide: (
								<ExternalLink
									href="https://jetpack.com/support/adding-credentials-to-jetpack/"
									onClick={ onLearnAddingCredentialsClick }
									children={ null }
								/>
							),
						},
					}
				) }
			</p>
			<p className="rewind-flow__info">
				{ translate(
					'If the issue persists, contact our support team to help you resolve the issue.'
				) }
			</p>
		</>
	);

	return (
		<Error
			errorText={ translate( 'Restore failed: %s', {
				args: [ backupDisplayDate ],
				comment: '%s is a time/date string',
			} ) }
			siteUrl={ siteUrl }
		>
			{ hasCredentials ? <ErrorDetails /> : <ErrorDetailsAddCredentials /> }
		</Error>
	);
};

export default RestoreError;
