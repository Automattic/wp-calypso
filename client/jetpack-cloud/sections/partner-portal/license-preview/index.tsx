/**
 * External dependencies
 */
import React, { useState, useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import {
	STATE_ATTACHED,
	STATE_DETACHED,
	STATE_REVOKED,
	getLicenseState,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { Button } from '@automattic/components';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Gridicon from 'calypso/components/gridicon';
import FormattedDate from 'calypso/components/formatted-date';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	licenseKey: string;
	domain: string;
	product: string;
	issuedOn: string;
	attachedOn: string;
	revokedOn: string;
}

export default function LicensePreview( {
	licenseKey,
	domain,
	product,
	issuedOn,
	attachedOn,
	revokedOn,
}: Props ) {
	const translate = useTranslate();
	const [ isOpen, setOpen ] = useState( false );
	const licenseState = getLicenseState( attachedOn, revokedOn );
	const showDomain = domain && [ STATE_ATTACHED, STATE_REVOKED ].indexOf( licenseState ) !== -1;

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
					'license-preview__card--is-detached': licenseState === STATE_DETACHED,
					'license-preview__card--is-revoked': licenseState === STATE_REVOKED,
				} ) }
			>
				<div>
					<h3 className="license-preview__domain">
						{ showDomain && <span>{ domain }</span> }

						{ licenseState === STATE_DETACHED && (
							<span className="license-preview__tag license-preview__tag--is-detached">
								<Gridicon icon="info-outline" size={ 18 } />
								{ translate( 'Detached' ) }
							</span>
						) }

						{ licenseState === STATE_REVOKED && (
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

					<FormattedDate date={ issuedOn } format="YYYY-MM-DD" />
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Attached on:' ) }</div>

					{ licenseState === STATE_ATTACHED && (
						<FormattedDate date={ attachedOn } format="YYYY-MM-DD" />
					) }

					{ licenseState !== STATE_ATTACHED && (
						<Gridicon icon="minus" className="license-preview__no-value" />
					) }
				</div>

				<div>
					<div className="license-preview__label">{ translate( 'Revoked on:' ) }</div>

					{ licenseState === STATE_REVOKED && (
						<FormattedDate date={ revokedOn } format="YYYY-MM-DD" />
					) }

					{ licenseState !== STATE_REVOKED && (
						<Gridicon icon="minus" className="license-preview__no-value" />
					) }
				</div>

				<div>
					{ licenseState === STATE_DETACHED && (
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
		</div>
	);
}
