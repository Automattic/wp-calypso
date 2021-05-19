/**
 * External dependencies
 */
import React, { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';
import { errorNotice } from 'calypso/state/notices/actions';
import { noop } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import useRefreshLicenseList from 'calypso/state/partner-portal/licenses/hooks/use-refresh-license-list';
import useRevokeLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-revoke-license-mutation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	onClose: ( action?: string ) => void;
}

export default function RevokeLicenseDialog( {
	licenseKey,
	product,
	siteUrl,
	onClose,
	...rest
}: Props ): ReactElement {
	let close = noop;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const refreshLicenceList = useRefreshLicenseList( LicenseListContext );
	const mutation = useRevokeLicenseMutation( {
		onSuccess: () => {
			close();
			dispatch( refreshLicenceList() );
		},
		onError: ( error: Error ) => {
			dispatch( errorNotice( error.message ) );
		},
	} );

	close = useCallback( () => {
		if ( ! mutation.isLoading ) {
			onClose();
		}
	}, [ onClose, mutation.isLoading ] );

	const revoke = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_list_revoke_dialog_revoke' ) );
		mutation.mutate( { licenseKey } );
	}, [ licenseKey, mutation.mutate ] );

	const buttons = [
		<Button disabled={ false } onClick={ close }>
			{ translate( 'Go back' ) }
		</Button>,

		<Button primary scary busy={ mutation.isLoading } onClick={ revoke }>
			{ translate( 'Revoke License' ) }
		</Button>,
	];

	buttons.unshift(
		<a
			href="https://github.com/Automattic/jetpack-licensing-api/tree/master/integration-docs#glossary"
			target="_blank"
			rel="noreferrer noopener"
		>
			{ translate( 'Learn more about revoking licenses' ) }
			&nbsp;
			<Gridicon icon="external" size={ 18 } />
		</a>
	);

	return (
		<Dialog
			isVisible={ true }
			buttons={ buttons }
			additionalClassNames="revoke-license-dialog"
			onClose={ close }
			{ ...rest }
		>
			<h2 className="revoke-license-dialog__heading">
				{ translate( 'Are you sure you want to revoke this license?' ) }
			</h2>

			<p>
				{ translate(
					'A revoked license cannot be reused, and the associated site will no longer have access to the provisioned product. You will stop being billed for this license immediately.'
				) }
			</p>

			<ul>
				{ siteUrl && (
					<li>
						<strong>{ translate( 'Site:' ) }</strong> { siteUrl }
					</li>
				) }
				<li>
					<strong>{ translate( 'Product:' ) }</strong> { product }
				</li>
				<li>
					<strong>{ translate( 'License:' ) }</strong> <code>{ licenseKey }</code>
				</li>
			</ul>

			<p className="revoke-license-dialog__warning">
				<Gridicon icon="info-outline" size={ 18 } />

				{ translate( 'Please note this action cannot be undone.' ) }
			</p>
		</Dialog>
	);
}
