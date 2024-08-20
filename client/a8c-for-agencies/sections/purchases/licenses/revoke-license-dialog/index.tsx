import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback, useState } from 'react';
import { noop } from 'calypso/jetpack-cloud/sections/partner-portal/lib/constants';
import { LicenseRole } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import useRefetchLicenses from '../hooks/use-refetch-licenses';
import LicensesOverviewContext from '../licenses-overview/context';
import useRevokeLicenseMutation from './hooks/use-revoke-license-mutation';
import { SecondaryConfirmationDialog } from './secondary-confirmation-dialog';

import './style.scss';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	onClose: ( action?: string ) => void;
	licenseRole?: LicenseRole;
	bundleSize?: number;
}

export default function RevokeLicenseDialog( {
	licenseKey,
	product,
	siteUrl,
	onClose,
	licenseRole = LicenseRole.Single,
	bundleSize = 1,
	...rest
}: Props ) {
	let close = noop;
	const translate = useTranslate();
	const dispatch = useDispatch();

	const refetchLicenses = useRefetchLicenses( LicensesOverviewContext );

	const { mutate, isPending, status, error } = useRevokeLicenseMutation();

	const [ showPressableConfirmationDialog, setShowPressableConfirmationDialog ] = useState( false );

	useEffect( () => {
		if ( status === 'success' ) {
			close();
			refetchLicenses();
		} else if ( status === 'error' ) {
			dispatch( errorNotice( error.message ) );
		}
	}, [ status, error, dispatch, close, refetchLicenses ] );

	// Use mutate function to trigger the mutation
	close = useCallback( () => {
		if ( ! isPending ) {
			onClose();
		}
	}, [ onClose, isPending ] );

	const revoke = useCallback(
		( force?: boolean ) => {
			if ( ! force && licenseKey.startsWith( 'pressable-wp' ) ) {
				setShowPressableConfirmationDialog( true );
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_a4a_license_list_revoke_dialog_revoke', {
					license_role: licenseRole,
				} )
			);
			mutate( { licenseKey } );
		},
		[ dispatch, licenseKey, licenseRole, mutate ]
	);

	const isParentLicense = licenseRole === LicenseRole.Parent;
	const isAssignedChildLicense = licenseRole === LicenseRole.Child && siteUrl;

	const buttons = [
		<Button disabled={ false } onClick={ close } key="cancel-button">
			{ translate( 'Go back' ) }
		</Button>,

		<Button primary scary busy={ isPending } onClick={ () => revoke() } key="revoke-button">
			{ isParentLicense ? translate( 'Revoke bundle' ) : translate( 'Revoke License' ) }
		</Button>,
	];

	const renderHeading = () => {
		if ( isParentLicense ) {
			return translate( 'Revoke bundle of %(count)s %(product)s licenses?', {
				args: {
					product,
					count: bundleSize,
				},
				comment:
					'The %(product)s is replaced with the product name and %(count)s is replace with the bundle size.',
			} );
		}

		if ( isAssignedChildLicense ) {
			return translate( 'Revoke %(product)s license?', {
				args: {
					product,
				},
				comment: 'The %(product)s is replaced with the product name.',
			} );
		}

		return translate( 'Are you sure you want to revoke this license?' );
	};

	const renderContent = () => {
		if ( isParentLicense ) {
			return (
				<p>
					{ translate(
						'Revoking this bundle will cause {{b}}%(product)s{{/b}} to stop working on your %(count)s assigned sites.',
						{
							args: {
								product,
								count: bundleSize,
							},
							components: {
								b: <b />,
							},
							comment:
								'The %(product)s is replaced with the product name and %(count)s is replace with the number of assigned sites.',
						}
					) }
				</p>
			);
		}

		if ( isAssignedChildLicense ) {
			return (
				<p>
					{ translate(
						'This license will be revoked from {{b}}%(siteUrl)s{{/b}}, and a new {{b}}%(product)s{{/b}} license will be created and added to the bundle.',
						{
							args: {
								product,
								siteUrl,
							},
							components: {
								b: <b />,
							},
							comment:
								'The %(siteUrl)s and %(product)s placeholders are replaced with the site URL and product name, respectively.',
						}
					) }
				</p>
			);
		}

		const showLearnMoreLink = false; // FIXME: Remove this once the correct link is added

		return (
			<>
				<p>
					{ translate(
						'A revoked license cannot be reused, and the associated site will no longer have access to the provisioned product. You will stop being billed for this license immediately.'
					) }
					{ showLearnMoreLink && (
						<>
							&nbsp;
							<a
								className="revoke-license-dialog__learn-more"
								href="https://" // FIXME: Add URL
								target="_blank"
								rel="noreferrer noopener"
							>
								{ translate( 'Learn more about revoking licenses' ) }
								&nbsp;
								<Gridicon icon="external" size={ 18 } />
							</a>
						</>
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
			</>
		);
	};

	if ( showPressableConfirmationDialog ) {
		return (
			<SecondaryConfirmationDialog
				title={ translate( 'Are you sure you want to revoke your Pressable plan?' ) }
				description={ translate(
					'If you continue to revoke, you will lose access to all of your Pressable sites. Are you sure you want to proceed?'
				) }
				onConfirm={ () => revoke( true ) }
				onCancel={ () => setShowPressableConfirmationDialog( false ) }
				isPending={ isPending }
			/>
		);
	}

	return (
		<Dialog
			isVisible
			buttons={ buttons }
			additionalClassNames="revoke-license-dialog"
			onClose={ close }
			{ ...rest }
		>
			<h2 className="revoke-license-dialog__heading">{ renderHeading() }</h2>

			{ renderContent() }

			<p className="revoke-license-dialog__warning">
				<Gridicon icon="info-outline" size={ 18 } />

				{ translate( 'Please note this action cannot be undone.' ) }
			</p>
		</Dialog>
	);
}
