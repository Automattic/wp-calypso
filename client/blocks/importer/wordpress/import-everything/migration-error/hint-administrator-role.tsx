import { useTranslate } from 'i18n-calypso';

interface Props {
	sourceSiteUrl: string;
	targetSiteUrl: string;
}
export const HintAdministratorRole = ( props: Props ) => {
	const translate = useTranslate();
	const { sourceSiteUrl, targetSiteUrl } = props;

	return (
		<div className="migration-error--hint">
			<p>
				{ translate(
					'Looks like you don’t currently have the administrator role on both the source and destination sites. To fix that, you’ll just need to:'
				) }
			</p>
			<ol>
				<li>
					{ translate(
						"Check that your user’s role is set as 'administrator' on both the {{linkA}}source{{/linkA}} and {{linkB}}destination{{/linkB}} sites.",
						{
							components: {
								linkA: (
									<a
										href={ `${ sourceSiteUrl }/wp-admin/users.php` }
										target="_blank"
										rel="noreferrer"
									/>
								),
								linkB: (
									<a
										href={ `${ targetSiteUrl }/wp-admin/users.php` }
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</li>
				<li>{ translate( "Click the 'Try again' button to restart the migration." ) }</li>
				<li>
					{ translate(
						'If you have any trouble changing a user’s role, feel free to reach out to our support team for help.'
					) }
				</li>
			</ol>
		</div>
	);
};
