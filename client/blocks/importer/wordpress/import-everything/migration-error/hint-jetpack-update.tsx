import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

interface Props {
	sourceSiteSlug: string;
}
export const HintJetpackUpdate = ( props: Props ) => {
	const translate = useTranslate();
	const { sourceSiteSlug } = props;

	return (
		<div className="migration-error--hint">
			<p>
				{ translate(
					'Looks like the installed version of Jetpack on your {{a}}source site{{/a}} is outdated. To fix that, you’ll just need to:',
					{
						components: {
							a: (
								<a
									href={ `${ sourceSiteSlug }/wp-admin/plugins.php` }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</p>
			<ol>
				<li>
					{ translate(
						'Head to our {{linkA}}documentation page{{/linkA}} and check that your source site’s Jetpack version is equal or higher than the one required. If not, you’ll need to update to the latest version. If you need some help with that, take a look at {{linkB}}these instructions{{/linkB}}.',
						{
							components: {
								linkA: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/import/import-an-entire-wordpress-site/#prerequisites'
										) }
										target="_blank"
										rel="noreferrer"
									/>
								),
								linkB: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/plugins/update-a-plugin-or-theme/'
										) }
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</li>
				<li>{ translate( "Click the 'Try again' button to restart the migration." ) }</li>
			</ol>
		</div>
	);
};
