import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export const Step1 = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const downloadLink = 'https://wordpress.org/plugins/jetpack-social/';
	const instructionsLink = 'https://jetpack.com/support/jetpack-social/';

	return (
		<p>
			{ translate(
				'{{downloadLink}}Download Social{{/downloadLink}} or install it directly from your site by following these {{instructions}}instructions{{/instructions}}.',
				{
					components: {
						downloadLink: (
							<a
								target="_blank"
								rel="noopener noreferrer"
								onClick={ () =>
									dispatch(
										recordTracksEvent( 'calypso_siteless_free_page_install_download_link_clicked', {
											product_slug: 'jetpack_social',
										} )
									)
								}
								href={ downloadLink }
							/>
						),
						instructions: (
							<a
								target="_blank"
								rel="noopener noreferrer"
								onClick={ () =>
									dispatch(
										recordTracksEvent(
											'calypso_siteless_free_page_install_instructions_link_clicked',
											{
												product_slug: 'jetpack_social',
											}
										)
									)
								}
								href={ instructionsLink }
							/>
						),
					},
				}
			) }
		</p>
	);
};
