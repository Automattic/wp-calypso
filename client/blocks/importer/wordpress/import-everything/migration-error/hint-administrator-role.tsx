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
			<p>{ translate( "You don't have the administrator role in both sites:" ) }</p>
			<ol>
				<li>
					{ translate(
						"Please ensure that your user's role is set as 'administrator' on both the {{linkA}}source{{/linkA}} and {{linkB}}destination{{/linkB}} sites, then retry the migration.",
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
				<li>
					{ translate(
						"If you have trouble setting a user's role, please reach out to our support team for help."
					) }
				</li>
			</ol>
		</div>
	);
};
