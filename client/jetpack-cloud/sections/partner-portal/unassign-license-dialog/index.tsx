import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { noop } from 'calypso/jetpack-cloud/sections/partner-portal/lib/constants';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import { useDispatch } from 'calypso/state';
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
}: Props ) {
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
		if ( ! mutation.isPending ) {
			onClose();
		}
	}, [ onClose, mutation.isPending ] );

	const unassign = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_list_unassign_dialog_unassign' ) );
		mutation.mutate( { licenseKey } );
	}, [ licenseKey, mutation.mutate ] );

	const buttons = [
		<Button disabled={ false } onClick={ close }>
			{ translate( 'Go back' ) }
		</Button>,

		<Button primary scary busy={ mutation.isPending } onClick={ unassign }>
			{ translate( 'Unassign License' ) }
		</Button>,
	];

	return (
		<Dialog
			isVisible
			buttons={ buttons }
			additionalClassNames="unassign-license-dialog"
			onClose={ close }
			{ ...rest }
		>
			<h2 className="unassign-license-dialog__heading">
				{ translate( 'Are you sure you want to unassign this license?' ) }
			</h2>
			<p>
				<strong>{ licenseKey }</strong>
			</p>
			<p>
				{ translate(
					'Unassigning this license means that the site {{bold}}%(siteUrl)s{{/bold}} will no longer have access to {{bold}}%(product)s{{/bold}}. Once this action is completed, you will be able to assign the license to another site. You will continue to be billed.',
					{
						components: { bold: <strong /> },
						args: { siteUrl: siteUrl ?? '', product },
					}
				) }
				&nbsp;
				<a
					className="unassign-license-dialog__learn-more"
					href="https://jetpack.com/support/jetpack-agency-licensing-portal-instructions/"
					target="_blank"
					rel="noreferrer noopener"
				>
					{ translate( 'Learn more about unassigning licenses' ) }
					&nbsp;
					<Gridicon icon="external" size={ 18 } />
				</a>
			</p>
		</Dialog>
	);
}
