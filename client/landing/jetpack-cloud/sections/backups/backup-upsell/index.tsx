/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteSlug } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Upsell from 'landing/jetpack-cloud/components/upsell';

/**
 * Style dependencies
 */
import './style.scss';

const BackupsUpsellPage: FunctionComponent = () => {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Main className="backup-upsell">
			<DocumentHead title="Backups" />
			<SidebarNavigation />
			<div className="backup-upsell__content">
				<Upsell
					headerText={ translate( 'Your site does not have backups' ) }
					bodyText={ translate(
						'Get peace of mind knowing your work will be saved, add backups today. Choose from real time or daily backups.'
					) }
					buttonLink={ `https://jetpack.com/upgrade/backup/?site=${ selectedSiteSlug }` }
					iconComponent={
						<div className="backup-upsell__icon-header">
							<img
								src="/calypso/images/illustrations/jetpack-cloud-backup-error.svg"
								alt="jetpack cloud backup error"
							/>
						</div>
					}
				/>
			</div>
		</Main>
	);
};

export default BackupsUpsellPage;
