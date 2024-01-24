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
			<p>{ translate( 'The installed version of Jetpack on the source site is outdated:' ) }</p>
			<ol>
				<li>
					{ translate(
						'Please check the current version of Jetpack installed on {{a}}the source site{{/a}} and ensure it’s active.',
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
				</li>
				<li>
					{ translate(
						'Visit our {{linkA}}documentation page{{/linkA}} and verify that the Jetpack version is equal or higher than the one required. Otherwise update it to the latest version. If you are unfamiliar with how to update a plugin, please follow {{linkB}}these instructions{{/linkB}}.',
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
				<li>
					{ translate(
						'Retry the migration by clicking the "Try again" button and check if the issue is resolved.'
					) }
				</li>
			</ol>
		</div>
	);
};
