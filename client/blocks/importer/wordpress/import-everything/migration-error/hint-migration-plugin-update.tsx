import { useTranslate } from 'i18n-calypso';

interface Props {
	sourceSiteSlug: string;
}
export const HintMigrationPluginUpdate = ( props: Props ) => {
	const translate = useTranslate();
	const { sourceSiteSlug } = props;

	return (
		<div className="migration-error--hint">
			<p>
				{ translate(
					"Looks like the the 'Move to WordPress.com' plugin is not updated and active. To fix that, you’ll just need to:",
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
						"Check the current version of the 'Move to WordPress.com' plugin installed on your {{a}}source site{{/a}} and make sure it’s active.",
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
				<li>{ translate( 'Update the plugin to the latest version.' ) }</li>
				<li>{ translate( "Click the 'Try again' button to restart the migration." ) }</li>
			</ol>
		</div>
	);
};
