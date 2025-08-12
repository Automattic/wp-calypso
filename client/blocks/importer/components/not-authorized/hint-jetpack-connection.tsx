import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

interface Props {
	sourceSiteUrl: string;
	targetSiteUrl: string;
}
export const HintJetpackConnection = ( props: Props ) => {
	const translate = useTranslate();
	const { sourceSiteUrl, targetSiteUrl } = props;

	return (
		<div className="migration-error--hint">
			<p>
				{ translate(
					'Looks like the Jetpack connection is broken on your {{a}}source site{{/a}}. To fix that, you’ll just need to:',
					{
						components: {
							a: <a href={ `${ sourceSiteUrl }/wp-admin` } target="_blank" rel="noreferrer" />,
						},
					}
				) }
			</p>
			<ol>
				<li>
					{ translate(
						"Check that your Jetpack connection is working properly by heading to the 'Connection' options in your {{linkA}}My Jetpack menu{{/linkA}}. You’ll want to make sure that both site and user show a 'connected' status and that the user account is the same for both the {{linkB}}source{{/linkB}} and {{linkC}}destination{{/linkC}} sites.",
						{
							components: {
								linkA: (
									<a
										href={ `${ sourceSiteUrl }/wp-admin/admin.php?page=my-jetpack` }
										target="_blank"
										rel="noreferrer"
									/>
								),
								linkB: (
									<a
										href={ `${ sourceSiteUrl }/wp-admin/users.php` }
										target="_blank"
										rel="noreferrer"
									/>
								),
								linkC: (
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
						'If you still can’t establish a Jetpack connection, please follow {{a}}these instructions{{/a}}.',
						{
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/'
										) }
										target="_blank"
										rel="noreferrer"
									/>
								),
							},
						}
					) }
				</li>
			</ol>
		</div>
	);
};
