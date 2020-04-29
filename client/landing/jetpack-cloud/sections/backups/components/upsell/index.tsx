/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackCloudBackupUpsell: FunctionComponent = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const jetpackBackupLink = `https://jetpack.com/upgrade/backup/?site=${ siteSlug }`;

	return (
		<Card className="upsell">
			<div className="upsell__header">
				<img
					src="/calypso/images/illustrations/jetpack-cloud-backup-error.svg"
					alt="jetpack cloud backup error"
				/>
			</div>
			<h2 className="upsell__title">{ translate( 'Your site does not have backups' ) }</h2>
			<p className="upsell__copy">
				{ translate(
					'Get peace of mind knowing your work will be saved, add backups today. Choose from real time or daily backups.'
				) }
			</p>
			<Button className="upsell__upgrade-button" href={ jetpackBackupLink } primary>
				{ translate( 'Upgrade Now' ) }
			</Button>
		</Card>
	);
};

export default JetpackCloudBackupUpsell;
