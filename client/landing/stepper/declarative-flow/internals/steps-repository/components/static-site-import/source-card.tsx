import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useStaticSiteImportSource } from './use-source';

export const SourceCard = () => {
	const { __ } = useI18n();
	const { host, platformName } = useStaticSiteImportSource();

	if ( ! host ) {
		return null;
	}

	return (
		<div className="static-site-import__source-card">
			<span className="static-site-import__source-host">{ host }</span>
			{ platformName && (
				<span className="static-site-import__source-platform">
					{ sprintf(
						/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
						__( 'Hosted with %s' ),
						platformName
					) }
				</span>
			) }
		</div>
	);
};
