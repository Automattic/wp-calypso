import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import { noop } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useRefreshLicenseList from 'calypso/state/partner-portal/licenses/hooks/use-refresh-license-list';
import useUnassignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-unassign-license-mutation';
import './style.scss';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	onClose: ( action?: string ) => void;
}

export default function UnassignLicenseDialog( {
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
	const mutation = useUnassignLicenseMutation( {
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

	const unassign = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_list_unassign_dialog_unassign' ) );
		mutation.mutate( { licenseKey } );
	}, [ licenseKey, mutation.mutate ] );

	const buttons = [
		<Button disabled={ false } onClick={ close }>
			{ translate( 'Go back' ) }
		</Button>,

		<Button primary scary busy={ mutation.isLoading } onClick={ unassign }>
			{ translate( 'Unassign License' ) }
		</Button>,
	];

	return (
		<Dialog
			isVisible={ true }
			buttons={ buttons }
			additionalClassNames="unassign-license-dialog"
			onClose={ close }
			{ ...rest }
		>
			<h2 className="unassign-license-dialog__heading">
				{ translate( 'Are you sure you want to unassign this license?' ) }
			</h2>
			<p>
				{ translate(
					'A unassigned license cannot be reused, and the associated site will no longer have access to the provisioned product. You will stop being billed for this license immediately.'
				) }
				&nbsp;
				<a
					className="unassign-license-dialog__learn-more"
					href="https://github.com/Automattic/jetpack-licensing-api/tree/master/integration-docs#glossary"
					target="_blank"
					rel="noreferrer noopener"
				>
					{ translate( 'Learn more about unassigning licenses' ) }
					&nbsp;
					<Gridicon icon="external" size={ 18 } />
				</a>
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
			<p className="unassign-license-dialog__warning">
				<Gridicon icon="info-outline" size={ 18 } />

				{ translate( 'Please note this action cannot be undone.' ) }
			</p>
		</Dialog>
	);
}
