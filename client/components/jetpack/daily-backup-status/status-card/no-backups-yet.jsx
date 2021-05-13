/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';
import { JETPACK_CONTACT_SUPPORT, CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { selectSiteId } from 'calypso/state/help/actions';
import { addQueryArgs } from 'calypso/lib/url';
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
	const dispatch = useDispatch();
	const onSupportClick = useCallback( () => dispatch( selectSiteId( siteId ) ), [
		dispatch,
		siteId,
	] );

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
				{ translate(
					"No backups yet, but don't worry, one should become available soon. {{support}}Contact support{{/support}} if you still see this message after {{strong}}24 hours{{/strong}}, or if you still need help.",
					{
						components: {
							strong: <strong />,
							support: (
								<a
									{ ...( isJetpackCloud()
										? {
												href: addQueryArgs( { url: siteUrl }, JETPACK_CONTACT_SUPPORT ),
												target: '_blank',
												rel: 'noopener noreferrer',
										  }
										: {
												href: CALYPSO_CONTACT,
												onClick: onSupportClick,
										  } ) }
								/>
							),
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
