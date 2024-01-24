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
			<p>{ translate( 'Your source site is inaccessible:' ) }</p>
			<ol>
				<li>
					{ translate( 'Visit your {{a}}source site{{/a}} and make sure you can access it.', {
						components: {
							a: <a href={ `${ sourceSiteUrl }/wp-admin` } target="_blank" rel="noreferrer" />,
						},
					} ) }
				</li>
				<li>
					{ translate(
						"Ensure that your Jetpack connection is functioning properly. To verify this, go to {{a}}My Jetpack{{/a}} and inspect the 'Connection' area. Confirm that both site and user show a “connected” status. Note that the user account should be the same on both the source and destination sites.",
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
						"If you still can't establish a Jetpack connection, please follow the {{a}}instructions{{/a}} to fix this issue and try again.",
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
						'Once you can access the source site, check the {{a}}plugin page{{/a}} for any CDN-related plugins.',
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
					{ translate(
						"Deactivate the CDN-related plugins in your WordPress dashboard, or disable the CDN from the service provider's control panel."
					) }
				</li>
				<li>
					{ translate(
						'Click "Try again" to restart the migration. If the problem persists, please reach out to our support team.'
					) }
				</li>
			</ol>
		</div>
	);
};
