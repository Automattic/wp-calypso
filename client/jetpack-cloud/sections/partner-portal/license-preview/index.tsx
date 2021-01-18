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
	getLicenseDominantState,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
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
	domain: string;
	product: string;
	issuedOn: string;
	attachedOn: string;
	revokedOn: string;
	username: string;
	blogId: number;
}

export default function LicensePreview( {
	licenseKey,
	domain,
	product,
	issuedOn,
	attachedOn,
	revokedOn,
	username,
	blogId,
}: Props ) {
	const translate = useTranslate();
	const [ isOpen, setOpen ] = useState( false );
	const dominantState = getLicenseDominantState( attachedOn, revokedOn );

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
					'license-preview__card--is-detached': dominantState === STATE_DETACHED,
					'license-preview__card--is-revoked': dominantState === STATE_REVOKED,
				} ) }
			>
				<div>
					<h3 className="license-preview__domain">
						{ domain &&
							( dominantState === STATE_ATTACHED || dominantState === STATE_REVOKED ) && (
								<span>{ domain }</span>
							) }

						{ dominantState === STATE_DETACHED && (
							<span className="license-preview__tag license-preview__tag--is-detached">
								<Gridicon icon="info-outline" size={ 18 } />
								{ translate( 'Detached' ) }
							</span>
						) }

						{ dominantState === STATE_REVOKED && (
							<span className="license-preview__tag license-preview__tag--is-revoked">
								<Gridicon icon="block" size={ 18 } />
								{ translate( 'Revoked' ) }
							</span>
						) }
					</h3>

					<span>{ translate( 'Product: %s', { args: [ product ] } ) }</span>
				</div>

				<div>
					<FormattedDate date={ issuedOn } format="YYYY-MM-DD" />
				</div>

				<div>
					{ dominantState === STATE_ATTACHED && (
						<FormattedDate date={ attachedOn } format="YYYY-MM-DD" />
					) }

					{ dominantState !== STATE_ATTACHED && (
						<Gridicon icon="minus" className="license-preview__no-value" />
					) }
				</div>

				<div>
					{ dominantState === STATE_REVOKED && (
						<FormattedDate date={ revokedOn } format="YYYY-MM-DD" />
					) }

					{ dominantState !== STATE_REVOKED && (
						<Gridicon icon="minus" className="license-preview__no-value" />
					) }
				</div>

				<div>
					{ dominantState === STATE_DETACHED && (
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
					<Button onClick={ open } borderless>
						<Gridicon icon={ isOpen ? 'chevron-up' : 'chevron-down' } />
					</Button>
				</div>
			</LicenseListItem>

			{ isOpen && (
				<LicenseDetails
					licenseKey={ licenseKey }
					issuedOn={ issuedOn }
					attachedOn={ attachedOn }
					revokedOn={ revokedOn }
					username={ username }
					blogId={ blogId }
				/>
			) }
		</div>
	);
}
