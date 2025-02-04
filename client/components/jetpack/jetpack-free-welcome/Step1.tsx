import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export const Step1 = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const jetpackInstallInstructionsLink =
		'https://jetpack.com/support/getting-started-with-jetpack/';
	const jetpackDownloadLink = 'https://wordpress.org/plugins/jetpack/';

	return (
		<>
			<h2>{ translate( 'Install Jetpack' ) }</h2>
			<p>
				{ translate(
					'{{downloadLink}}Download Jetpack{{/downloadLink}} or install it directly from your site by following the {{a}}instructions we put together here{{/a}}.',
					{
						components: {
							downloadLink: (
								<a
									target="_blank"
									rel="noopener noreferrer"
									onClick={ () =>
										dispatch(
											recordTracksEvent(
												'calypso_siteless_free_page_download_jetpack_link_clicked',
												{
													product_slug: 'jetpack_free',
												}
											)
										)
									}
									href={ jetpackDownloadLink }
								/>
							),
							a: (
								<a
									target="_blank"
									rel="noopener noreferrer"
									onClick={ () =>
										dispatch(
											recordTracksEvent(
												'calypso_siteless_free_page_install_instructions_link_clicked',
												{
													product_slug: 'jetpack_free',
												}
											)
										)
									}
									href={ jetpackInstallInstructionsLink }
								/>
							),
						},
					}
				) }
			</p>
		</>
	);
};
