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
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import JetpackLogo from 'calypso/components/jetpack-logo';
/**
 * Style dependencies
 */
import './style.scss';
import cloudWarningIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-warning-orange-30.svg';

/**
 * Type dependencies
 */
import type { Moment } from 'moment';

type Props = { selectedDate: Moment; isFeatured: boolean };

const NoBackupsOnSelectedDate: FunctionComponent< Props > = ( { selectedDate, isFeatured } ) => {
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );

	const displayDate = selectedDate.format( 'MMM Do' );
	const nextDate = selectedDate.clone().add( 1, 'days' );
	const displayNextDate = nextDate.format( 'll' );

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
							{ translate( 'No Backup for %(displayDate)s', {
								args: { displayDate },
							} ) }
						</h2>
						<p className="backup-card__title backup-card__title--delayed">
							<img className="backup-card__icon" src={ cloudWarningIcon } alt="" />
							{ translate( 'Backup was delayed' ) }
						</p>
					</div>
				</div>
				<ul className="backup-card__actions">
					<li>
						<Button
							className="backup-card__support-button"
							href={ contactSupportUrl( siteUrl ) }
							target="_blank"
							rel="noopener noreferrer"
							primary
						>
							{ translate( 'Contact support' ) }
						</Button>
					</li>
				</ul>
			</div>
			<div className="backup-card__about">
				<h3 className="backup-card__about-heading">{ translate( 'About this backup' ) }</h3>
				<div className="backup-card__about-content">
					<ul className="backup-card__about-list">
						<li>
							<div className="backup-card__about-media backup-card__about-media--notice">
								<JetpackLogo className="backup-card__jetpack-logo-warning" size={ 32 } />
							</div>
							<div className="backup-card__about-body">
								{ translate(
									'Don’t worry, the backup was most likely completed in the early hours of the following morning. ' +
										'Check the following day ({{link}}%(displayNextDate)s{{/link}}) or contact support if you need help.',
									{
										args: { displayNextDate },
										components: {
											link: (
												<a
													href={ backupMainPath( siteSlug, {
														date: nextDate.format( INDEX_FORMAT ),
													} ) }
												/>
											),
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

export default NoBackupsOnSelectedDate;
