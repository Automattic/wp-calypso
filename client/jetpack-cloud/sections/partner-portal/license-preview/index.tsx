/**
 * External dependencies
 */
import React, { useState, useCallback, ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
import { getUrlParts } from 'calypso/lib/url';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { getLicenseState } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { LicenseStates } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { Button } from '@automattic/components';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Gridicon from 'calypso/components/gridicon';
import FormattedDate from 'calypso/components/formatted-date';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';
import LicenseDetails from 'calypso/jetpack-cloud/sections/partner-portal/license-details';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	licenseKey: string;
	product: string;
	username: string | null;
	blogId: number | null;
	siteUrl: string | null;
	issuedAt: string;
	attachedAt: string | null;
	revokedAt: string | null;
}

export default function LicensePreview( {
	licenseKey,
	product,
	username,
	blogId,
	siteUrl,
	issuedAt,
	attachedAt,
	revokedAt,
}: Props ): ReactElement {
	const translate = useTranslate();
	const [ isOpen, setOpen ] = useState( false );
	const licenseState = getLicenseState( attachedAt, revokedAt );
	const domain = siteUrl ? getUrlParts( siteUrl ).hostname : '';
	const showDomain = domain && [ LicenseStates.Attached, LicenseStates.Revoked ].indexOf( licenseState ) !== -1;

	const open = useCallback( () => {
		setOpen( ! isOpen );
	}, [ isOpen ] );

	return (
		<div
			className={ classnames( {
				'license-preview': true,
				'license-preview--is-open': isOpen,
			} ) }
		>
			<LicenseListItem
				className={ classnames( {
					'license-preview__card': true,
					'license-preview__card--is-detached': licenseState === LicenseStates.Detached,
					'license-preview__card--is-revoked': licenseState === LicenseStates.Revoked,
				} ) }
			>
				<div>
					<h3 className="license-preview__domain">
						{ showDomain && <span>{ domain }</span> }

						{ licenseState === LicenseStates.Detached && (
							<span className="license-preview__tag license-preview__tag--is-detached">
								<Gridicon icon="info-outline" size={ 18 } />
								{ translate( 'Detached' ) }
							</span>
						) }

						{ licenseState === LicenseStates.Revoked && (
							<span className="license-preview__tag license-preview__tag--is-revoked">
								<Gridicon icon="block" size={ 18 } />
								{ translate( 'Revoked' ) }
							</span>
						) }
					</h3>

					<span className="license-preview__product">
						<span>{ translate( 'Product:' ) } </span>
						{ product }
					</span>
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Issued on:' ) }</div>

					<FormattedDate date={ issuedAt } format="YYYY-MM-DD" />
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Attached on:' ) }</div>

					{ licenseState === LicenseStates.Attached && (
						<FormattedDate date={ attachedAt } format="YYYY-MM-DD" />
					) }

					{ licenseState !== LicenseStates.Attached && (
						<Gridicon icon="minus" className="license-preview__no-value" />
					) }
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Revoked on:' ) }</div>

					{ licenseState === LicenseStates.Revoked && (
						<FormattedDate date={ revokedAt } format="YYYY-MM-DD" />
					) }

					{ licenseState !== LicenseStates.Revoked && (
						<Gridicon icon="minus" className="license-preview__no-value" />
					) }
				</div>

				<div>
					{ licenseState === LicenseStates.Detached && (
						<ClipboardButton
							text={ licenseKey }
							className="license-preview__copy-license-key"
							compact
						>
							{ translate( 'Copy License' ) }
						</ClipboardButton>
					) }
				</div>

				<div>
					<Button onClick={ open } className="license-preview__toggle" borderless>
						<Gridicon icon={ isOpen ? 'chevron-up' : 'chevron-down' } />
					</Button>
				</div>
			</LicenseListItem>

			{ isOpen && (
				<LicenseDetails
					licenseKey={ licenseKey }
					username={ username }
					blogId={ blogId }
					issuedAt={ issuedAt }
					attachedAt={ attachedAt }
					revokedAt={ revokedAt }
				/>
			) }
		</div>
	);
}
