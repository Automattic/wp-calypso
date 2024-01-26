import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

interface Props {
	sourceSiteUrl: string;
}
export const HintBackupFail = ( props: Props ) => {
	const translate = useTranslate();
	const { sourceSiteUrl } = props;

	return (
		<div className="migration-error--hint">
			<p>
				{ translate(
					'Looks like your source site is currently inaccessible. Here are a few things you can try to make sure it’s ready for the migration:'
				) }
			</p>
			<ol>
				<li>
					{ translate( 'Visit your {{a}}source site{{/a}} to make sure it’s up and running.', {
						components: {
							a: <a href={ `${ sourceSiteUrl }/wp-admin` } target="_blank" rel="noreferrer" />,
						},
					} ) }
				</li>
				<li>
					{ translate(
						"Check that your Jetpack connection is working properly by heading to the 'Connection' options in your {{a}}My Jetpack{{/a}} menu. You’ll want to make sure that both site and user show a ‘connected’ status and that the user account is the same for both the source and destination sites.",
						{
							components: {
								a: (
									<a
										href={ `${ sourceSiteUrl }/wp-admin/admin.php?page=my-jetpack` }
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</li>
				<li>
					{ translate(
						'If you still can’t establish a Jetpack connection, please follow {{a}}these instructions{{/a}}.',
						{
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/ '
										) }
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</li>
				<li>
					{ translate(
						"Once you can access the source site, check the {{a}}plugins admin page{{/a}} for any CDN-related plugins. If you have any active, deactivate them in your WordPress dashboard, or disable the CDN from the service provider’s control panel. Then, click 'Try again' to restart the migration.",
						{
							components: {
								a: (
									<a
										href={ `${ sourceSiteUrl }/wp-admin/plugins.php` }
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</li>
				<li>
					{ translate( 'If the problem persists, feel free to reach out to our support team.' ) }
				</li>
			</ol>
		</div>
	);
};
