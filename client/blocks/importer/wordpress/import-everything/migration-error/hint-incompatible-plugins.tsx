import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

export const HintIncompatiblePlugins = () => {
	const translate = useTranslate();

	return (
		<div className="migration-error--hint">
			<ol>
				<li>
					{ translate(
						'Please ensure that you have deactivated all incompatible plugins on the source site. ',
						{
							components: {
								a: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/plugins/incompatible-plugins/'
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
