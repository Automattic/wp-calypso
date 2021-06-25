/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import { INDEX_FORMAT } from 'calypso/lib/jetpack/backup-utils';
import { backupMainPath } from 'calypso/my-sites/backup/paths';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import Button from 'calypso/components/forms/form-button';

/**
 * Style dependencies
 */
import './style.scss';
import cloudWarningIcon from './icons/cloud-warning.svg';

const NoBackupsOnSelectedDate = ( { selectedDate } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );

	const displayDate = selectedDate.format( 'll' );
	const nextDate = selectedDate.clone().add( 1, 'days' );
	const displayNextDate = nextDate.format( 'll' );

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudWarningIcon } alt="" role="presentation" />
				<div className="status-card__title">{ translate( 'No backup' ) }</div>
			</div>

			<div className="status-card__label">
				<p>
					{ translate( 'The backup attempt for %(displayDate)s was delayed.', {
						args: { displayDate },
					} ) }
				</p>
				<p>
					{ translate(
						'But don’t worry, it was likely completed in the early hours the next morning. ' +
							'Check the following day, {{link}}%(displayNextDate)s{{/link}} or contact support if you still need help.',
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
				</p>
			</div>

			<Button
				className="status-card__support-button"
				href={ contactSupportUrl( siteUrl ) }
				target="_blank"
				rel="noopener noreferrer"
				isPrimary={ false }
			>
				{ translate( 'Contact support' ) }
			</Button>
		</>
	);
};

export default NoBackupsOnSelectedDate;
