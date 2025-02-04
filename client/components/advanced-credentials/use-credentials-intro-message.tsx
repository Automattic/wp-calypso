import config from '@automattic/calypso-config';
import { WPCOM_FEATURES_BACKUPS, WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { SiteId } from 'calypso/types';

const useCredentialsIntroMessage = ( siteId: SiteId ) => {
	const translate = useTranslate();

	const messages = {
		LEGACY: translate(
			'In order to restore your site, should something go wrong, you’ll need to provide your website’s {{strong}}SSH{{/strong}}, {{strong}}SFTP{{/strong}} or {{strong}}FTP{{/strong}} server credentials. We’ll guide you through it:',
			{
				components: { strong: <strong /> },
			}
		),
		BACKUP: translate(
			'We are able to restore sites without credentials. However, in some cases, due to site configuration, we need your website’s {{strong}}SSH{{/strong}}, {{strong}}SFTP{{/strong}} or {{strong}}FTP{{/strong}} server credentials. We’ll guide you through it:',
			{
				components: { strong: <strong /> },
			}
		),
		SCAN: translate(
			'We need your website’s {{strong}}SSH{{/strong}}, {{strong}}SFTP{{/strong}} or {{strong}}FTP{{/strong}} server credentials, so that we can auto-fix threats. We’ll guide you through it:',
			{
				components: { strong: <strong /> },
			}
		),
		BACKUP_AND_SCAN: translate(
			'We need your website’s {{strong}}SSH{{/strong}}, {{strong}}SFTP{{/strong}} or {{strong}}FTP{{/strong}} server credentials, so that we can auto-fix threats. In some cases, they might be necessary for restores, too. We’ll guide you through it:',
			{
				components: { strong: <strong /> },
			}
		),
	};

	const hasBackup = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS )
	);

	const hasScan = useSelector( ( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ) );

	// If the feature flag for preflight checks is disabled, return the existing message
	if ( ! config.isEnabled( 'jetpack/backup-restore-preflight-checks' ) ) {
		return messages.LEGACY;
	}

	if ( hasBackup && hasScan ) {
		return messages.BACKUP_AND_SCAN;
	}

	if ( hasBackup ) {
		return messages.BACKUP;
	}

	if ( hasScan ) {
		return messages.SCAN;
	}

	// Return BACKUP_AND_SCAN by default
	return messages.BACKUP_AND_SCAN;
};

export default useCredentialsIntroMessage;
