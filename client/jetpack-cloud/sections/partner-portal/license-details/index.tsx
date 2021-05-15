/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getLicenseState, noop } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { LicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { Card } from '@automattic/components';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Gridicon from 'calypso/components/gridicon';
import FormattedDate from 'calypso/components/formatted-date';
import LicenseDetailsActions from 'calypso/jetpack-cloud/sections/partner-portal/license-details/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	username: string | null;
	blogId: number | null;
	issuedAt: string;
	attachedAt: string | null;
	revokedAt: string | null;
	onCopyLicense?: () => void;
}

const DETAILS_DATE_FORMAT = 'YYYY-MM-DD h:mm:ss A';

export default function LicenseDetails( {
	licenseKey,
	product,
	siteUrl,
	username,
	blogId,
	issuedAt,
	attachedAt,
	revokedAt,
	onCopyLicense = noop,
}: Props ): ReactElement {
	const translate = useTranslate();
	const licenseState = getLicenseState( attachedAt, revokedAt );

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
							onCopy={ onCopyLicense }
						>
							<Gridicon icon="clipboard" />
						</ClipboardButton>
					</div>
				</li>

				<li className="license-details__list-item license-details__list-item--wide">
					<h4 className="license-details__label">{ translate( 'Blog URL' ) }</h4>
					{ siteUrl ? (
						<a href={ siteUrl } target="_blank" rel="noopener noreferrer">
							{ siteUrl }
						</a>
					) : (
						<Gridicon icon="minus" />
					) }
				</li>

				<li className="license-details__list-item">
					<h4 className="license-details__label">{ translate( 'Issued on' ) }</h4>
					<FormattedDate date={ issuedAt } format={ DETAILS_DATE_FORMAT } />
				</li>

				{ licenseState === LicenseState.Attached && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Assigned on' ) }</h4>
						<FormattedDate date={ attachedAt } format={ DETAILS_DATE_FORMAT } />
					</li>
				) }

				{ licenseState === LicenseState.Detached && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Assigned on' ) }</h4>
						<Gridicon icon="minus" />
					</li>
				) }

				{ licenseState === LicenseState.Revoked && (
					<li className="license-details__list-item">
						<h4 className="license-details__label">{ translate( 'Revoked on' ) }</h4>
						<FormattedDate date={ revokedAt } format={ DETAILS_DATE_FORMAT } />
					</li>
				) }

				<li className="license-details__list-item">
					<h4 className="license-details__label">{ translate( "Owner's User ID" ) }</h4>
					{ username ? <span>{ username }</span> : <Gridicon icon="minus" /> }
				</li>

				<li className="license-details__list-item">
					<h4 className="license-details__label">{ translate( 'Blog ID' ) }</h4>
					{ blogId ? <span>{ blogId }</span> : <Gridicon icon="minus" /> }
				</li>
			</ul>

			<LicenseDetailsActions
				licenseKey={ licenseKey }
				product={ product }
				siteUrl={ siteUrl }
				attachedAt={ attachedAt }
				revokedAt={ revokedAt }
			/>
		</Card>
	);
}
