/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import ExternalLink from 'components/external-link';
import Button from 'components/forms/form-button';
import contactSupportUrl from 'lib/jetpack/contact-support-url';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import getRawSite from 'state/selectors/get-raw-site';
import getSiteAdminUrl from 'state/sites/selectors/get-site-admin-url';
import getSiteUrl from 'state/sites/selectors/get-site-url';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';

/**
 * Style dependencies
 */
import './style.scss';
import cloudPendingIcon from './icons/cloud-pending.svg';
import cloudWarningIcon from './icons/cloud-warning.svg';

const NoBackupsYet = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const siteName = useSelector( ( state ) => getRawSite( state, siteId ) )?.name;

	if ( isEnabled( 'jetpack/backup-simplified-screens' ) ) {
		return (
			<>
				<div className="status-card__message-head">
					<img src={ cloudPendingIcon } alt="" role="presentation" />
					<div>
						{ translate( 'We are preparing to backup %s', {
							args: siteName,
							comment: '%s is the name of the site',
						} ) }
					</div>
				</div>
				<h2 className="status-card__title">
					{ translate( 'Your first backup will be ready soon' ) }
				</h2>
				<div className="status-card__label">
					{ isJetpackCloud()
						? translate(
								'Your first backup will appear here {{strong}}within 24 hours{{/strong}} and you will receive a {{wpcomLink/}} notification once the backup has been completed.',
								{
									components: {
										strong: <strong />,
										wpcomLink: (
											<ExternalLink href="https://wordpress.com">WordPress.com</ExternalLink>
										),
									},
								}
						  )
						: translate(
								'Your first backup will appear here {{strong}}within 24 hours{{/strong}} and you will receive a notification once the backup has been completed.',
								{
									components: {
										strong: <strong />,
									},
								}
						  ) }
				</div>
				<ul className="status-card__link-list">
					<li>
						<ExternalLink href={ siteUrl }>{ translate( 'Visit your website' ) }</ExternalLink>
					</li>
					<li>
						<ExternalLink href={ adminUrl }>{ translate( 'Manage your website' ) }</ExternalLink>
					</li>
				</ul>
			</>
		);
	}

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudWarningIcon } alt="" role="presentation" />
				<div>{ translate( 'No backups are available yet' ) }</div>
			</div>
			<div className="status-card__label">
				{ translate(
					'But don’t worry, one should become available in the next 24 hours. Contact support if you still need help.'
				) }
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

export default NoBackupsYet;
