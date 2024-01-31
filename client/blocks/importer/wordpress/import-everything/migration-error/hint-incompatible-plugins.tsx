import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';

export const HintIncompatiblePlugins = () => {
	const translate = useTranslate();

	return (
		<div className="migration-error--hint">
			<ol>
				<li>
					{ translate(
						'Please double-check that you’ve deactivated any {{a}}incompatible plugins{{/a}} on the source site.',
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
				<li>{ translate( "Click the 'Try again' button to restart the migration." ) }</li>
			</ol>
		</div>
	);
};
