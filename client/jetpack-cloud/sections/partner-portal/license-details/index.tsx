/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	STATE_ATTACHED,
	STATE_DETACHED,
	STATE_REVOKED,
	getLicenseState,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { Button, Card } from '@automattic/components';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Gridicon from 'calypso/components/gridicon';
import FormattedDate from 'calypso/components/formatted-date';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	licenseKey: string;
	issuedOn: string;
	attachedOn: string;
	revokedOn: string;
	username: string;
	blogId: number;
}

export default function LicenseDetails( {
	licenseKey,
	issuedOn,
	attachedOn,
	revokedOn,
	username,
	blogId,
}: Props ) {
	const translate = useTranslate();
	const licenseState = getLicenseState( attachedOn, revokedOn );

	return (
		<Card className="license-details">
			<ul className="license-details__list">
				<li className="license-details__list-item license-details__list-item--wide">
					<h4 className="license-details__label">{ translate( 'License code' ) }</h4>

					<div className="license-details__license-key-row">
						<code className="license-details__license-key">{ licenseKey }</code>

						<ClipboardButton
							text={ licenseKey }
							className="license-details__clipboard-button"
							borderless
							compact
						>
							<Gridicon icon="clipboard" />
						</ClipboardButton>
					</div>
				</li>

				<li className="license-details__list-item">
					<h4 className="license-details__label">{ translate( 'Issued on' ) }</h4>
					<FormattedDate date={ issuedOn } format="LLL" />
				</li>

				{ licenseState === STATE_ATTACHED && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Attached on' ) }</h4>
						<FormattedDate date={ attachedOn } format="LLL" />
					</li>
				) }

				{ licenseState === STATE_DETACHED && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Attached on' ) }</h4>
						<Gridicon icon="minus" />
					</li>
				) }

				{ licenseState === STATE_REVOKED && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Revoked on' ) }</h4>
						<FormattedDate date={ revokedOn } format="LLL" />
					</li>
				) }

				<li className="license-details__list-item">
					<h4 className="license-details__label">{ translate( "Owner's User ID" ) }</h4>
					<span>{ username }</span>
				</li>

				<li className="license-details__list-item">
					<h4 className="license-details__label">{ translate( 'Blog ID' ) }</h4>
					<span>{ blogId }</span>
				</li>
			</ul>
			<div className="license-details__actions">
				<Button scary>{ translate( 'Revoke License' ) }</Button>
			</div>
		</Card>
	);
}
