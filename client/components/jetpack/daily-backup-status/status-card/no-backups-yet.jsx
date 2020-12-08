/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

/**
 * Style dependencies
 */
import './style.scss';
import cloudPendingIcon from './icons/cloud-pending.svg';

const NoBackupsYet = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const siteName = useSelector( ( state ) => getRawSite( state, siteId ) )?.name;

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
};

export default NoBackupsYet;
