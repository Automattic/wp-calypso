/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import JetpackLogo from 'calypso/components/jetpack-logo';
/**
 * Style dependencies
 */
import './style.scss';
import cloudPendingIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-pending-gray-30.svg';

type Props = { isFeatured: boolean };
interface rawSite {
	name: string;
}

const NoBackupsYet: FunctionComponent< Props > = ( { isFeatured } ) => {
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const rawSite = useSelector( ( state ) => getRawSite( state, siteId ) ) as rawSite | null;
	const siteName = rawSite?.name;

	return (
		<Card
			className={ classNames( 'backup-card', {
				'is-featured': isFeatured,
			} ) }
		>
			<div className="backup-card__main">
				<div className="backup-card__header">
					<div className="backup-card__header-text">
						<h2 className="backup-card__date">
							{ translate( 'Your first backup will be ready soon' ) }
						</h2>
						<p className="backup-card__title backup-card__title--preparing">
							<img className="backup-card__icon" src={ cloudPendingIcon } alt="" />
							{ translate( 'We are preparing to backup %s', {
								args: siteName,
								comment: '%s is the name of the site',
							} ) }
						</p>
					</div>
				</div>
				<ul className="backup-card__actions">
					<li>
						<Button
							className="backup-card__support-button"
							href={ siteUrl }
							target="_blank"
							rel="noopener noreferrer"
							primary
						>
							{ translate( 'Visit your website' ) }
						</Button>
					</li>
					<li>
						<Button
							className="backup-card__support-button"
							href={ adminUrl }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ translate( 'Manage your website' ) }
						</Button>
					</li>
				</ul>
			</div>
			<div className="backup-card__about">
				<div className="backup-card__about-content">
					<ul className="backup-card__about-list">
						<li>
							<div className="backup-card__about-media backup-card__about-media--notice">
								<JetpackLogo className="backup-card__jetpack-logo-muted" size={ 32 } />
							</div>
							<div className="backup-card__about-body">
								{ translate(
									'Your first backup will appear here {{strong}}within 24 hours{{/strong}} and you will receive a notification once the backup has been completed.',
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</div>
						</li>
					</ul>
				</div>
			</div>
		</Card>
	);
};

export default NoBackupsYet;
