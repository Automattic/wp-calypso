/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import contactSupportUrl from 'lib/jetpack/contact-support-url';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSiteUrl from 'state/sites/selectors/get-site-url';
import Button from 'components/forms/form-button';

/**
 * Style dependencies
 */
import './style.scss';
import cloudWarningIcon from './icons/cloud-warning.svg';

const NoBackupsYet = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );

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
