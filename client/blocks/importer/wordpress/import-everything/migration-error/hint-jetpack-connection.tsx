import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

interface Props {
	sourceSiteUrl: string;
}
export const HintJetpackConnection = ( props: Props ) => {
	const translate = useTranslate();
	const { sourceSiteUrl } = props;

	return (
		<div className="migration-error--hint">
			<p>
				{ translate( 'Jetpack connection is broken on the {{a}}source site{{/a}}:', {
					components: {
						a: <a href={ `${ sourceSiteUrl }/wp-admin` } target="_blank" rel="noreferrer" />,
					},
				} ) }
			</p>
			<ol>
				<li>
					{ translate(
						"Ensure that your Jetpack connection is functioning properly: go to {{a}}My Jetpack{{/a}} and inspect the 'Connection' area. Confirm that both the site and the user show a “connected” status. The user account should be the same in both the source and destination sites.",
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
						'If you can’t still establish a Jetpack connection, please follow {{a}}these instructions{{/a}} and retry the migration.',
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
				<li>{ translate( 'If the problem persists, please reach out to our support team.' ) }</li>
			</ol>
		</div>
	);
};
