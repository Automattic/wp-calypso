import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../components/notice';

interface LatestVersionNoticeProps {
	wpVersion: string;
}

export function LatestVersionNotice( { wpVersion }: LatestVersionNoticeProps ) {
	return (
		<Notice variant="success" title={ __( 'WordPress version updated' ) }>
			{ sprintf(
				// translators: %s: WordPress version, e.g. "7.0-RC2"
				__( 'Your site is now running WordPress %s.' ),
				wpVersion
			) }
		</Notice>
	);
}
