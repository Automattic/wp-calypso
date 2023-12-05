import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { noop } from 'calypso/jetpack-cloud/sections/partner-portal/lib/constants';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useRefreshLicenseList from 'calypso/state/partner-portal/licenses/hooks/use-refresh-license-list';
import useRevokeLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-revoke-license-mutation';
import './style.scss';
import { useProductBundleDetachedSize } from './hooks/use-product-bundle-detached-size';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	onClose: ( action?: string ) => void;
	bundleGroupSize: number;
}

export default function RevokeLicenseDialog( {
	licenseKey,
	product,
	siteUrl,
	onClose,
	bundleGroupSize,
	...rest
}: Props ) {
	let close = noop;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const refreshLicenceList = useRefreshLicenseList( LicenseListContext );
	const detachedSizes = useProductBundleDetachedSize( bundleGroupSize );

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
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_license_list_revoke_child_license_dialog_revoke' )
		);
		mutation.mutate( { licenseKey } );
	}, [ dispatch, licenseKey, mutation ] );

	return (
		<Dialog
			isVisible={ true }
			additionalClassNames="revoke-child-license-dialog"
			onClose={ close }
			{ ...rest }
		>
			<h2 className="revoke-child-license-dialog__heading">
				{ translate( 'Revoke %(productName)s License?', {
					args: {
						productName: product,
					},
				} ) }
			</h2>

			<p>
				{ detachedSizes.length === 1
					? translate(
							'This license is part of a bundle of %(size)d licenses. If you revoke this license, the bundle will be removed and the remaining licenses will be converted to individual licenses, billed at full price.',
							{
								args: {
									size: bundleGroupSize,
								},
							}
					  )
					: translate(
							'This license is part of a bundle of %(size)d licenses. If you revoke this license, the bundle will be removed and the remaining %(remainingSize)d licenses will be converted into:',
							{
								args: {
									size: bundleGroupSize,
									remainingSize: bundleGroupSize - 1,
								},
							}
					  ) }
			</p>

			{ detachedSizes.length > 1 && (
				<ul className="revoke-child-license-dialog__list">
					{ detachedSizes.map( ( { size, count } ) => (
						<li key={ size }>
							{ size === 1
								? translate( '%(count)d single licenses', { args: { count } } )
								: translate( 'Bundle of %(size)d licenses', { args: { size } } ) }
						</li>
					) ) }
				</ul>
			) }

			<div className="revoke-child-license-dialog__actions">
				<Button primary scary busy={ mutation.isLoading } onClick={ revoke }>
					{ translate( 'Revoke License' ) }
				</Button>

				<Button disabled={ false } onClick={ close } borderless>
					{ translate( 'Cancel' ) }
				</Button>
			</div>
		</Dialog>
	);
}
