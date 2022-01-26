import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getUserLicenses, getUserLicensesCounts } from 'calypso/state/user-licensing/selectors';
import type { License } from 'calypso/state/user-licensing/types';

import './style.scss';

interface Props {
	siteId: number;
}

function LicensingPromptDialog( { siteId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ showLicensesDialog, setShowLicensesDialog ] = useState< boolean >( false );
	const [ detachedUserLicense, setDetachedUserLicense ] = useState< License | null >( null );
	const userLicenses = useSelector( getUserLicenses );
	const userLicensesCounts = useSelector( getUserLicensesCounts );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const jetpackDashboardUrl = siteAdminUrl + 'admin.php?page=jetpack#/license/activation';

	const hasOneDetachedLicense = userLicensesCounts && userLicensesCounts[ 'detached' ] === 1;
	const hasDetachedLicenses = userLicensesCounts && userLicensesCounts[ 'detached' ] !== 0;

	useEffect( () => {
		if ( userLicenses && hasOneDetachedLicense ) {
			setDetachedUserLicense(
				Object.values( userLicenses.items ).filter( ( { attachedAt } ) => attachedAt === null )[ 0 ]
			);
		}
	}, [ hasOneDetachedLicense, userLicenses ] );

	useEffect( () => {
		if ( hasDetachedLicenses && siteAdminUrl ) {
			setShowLicensesDialog( true );
		}
	}, [ hasDetachedLicenses, siteAdminUrl ] );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_user_license_modal_view' ) );
	}, [ dispatch ] );

	const title = useMemo( () => {
		if ( hasOneDetachedLicense ) {
			return detachedUserLicense?.product
				? preventWidows(
						translate( 'Activate %(productName)s', {
							args: {
								productName: detachedUserLicense.product,
							},
						} )
				  )
				: preventWidows( translate( 'Your product is pending activation' ) );
		}
		return preventWidows( translate( 'Activate your new Jetpack features' ) );
	}, [ detachedUserLicense, hasOneDetachedLicense, translate ] );

	const activateProductClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_user_license_modal_activate_click' ) );
	}, [ dispatch ] );

	const selectAnotherProductClick = useCallback( () => {
		setShowLicensesDialog( false );
		dispatch( recordTracksEvent( 'calypso_user_license_modal_continue_click' ) );
	}, [ dispatch ] );

	const closeDialog = useCallback( () => {
		setShowLicensesDialog( false );
		dispatch( recordTracksEvent( 'calypso_user_license_modal_close_click' ) );
	}, [ dispatch ] );

	return (
		<Dialog
			additionalClassNames="licensing-prompt-dialog"
			isVisible={ showLicensesDialog }
			onClose={ closeDialog }
			shouldCloseOnEsc
		>
			<h1 className="licensing-prompt-dialog__title">{ title }</h1>
			<Gridicon
				className="licensing-prompt-dialog__close"
				icon="cross-small"
				size={ 24 }
				onClick={ selectAnotherProductClick }
			/>
			<p className="licensing-prompt-dialog__instructions">
				{ preventWidows(
					translate(
						'{{strong}}Check your email{{/strong}} for your license key. You should have received it after making your purchase.',
						{
							components: {
								strong: <strong />,
							},
						}
					)
				) }
			</p>
			<div className="licensing-prompt-dialog__actions">
				<Button
					className="licensing-prompt-dialog__btn"
					primary
					href={ jetpackDashboardUrl }
					onClick={ activateProductClick }
				>
					{ translate( 'Activate it now' ) }
				</Button>
				<Button className="licensing-prompt-dialog__btn" onClick={ selectAnotherProductClick }>
					{ translate( 'Select another product' ) }
				</Button>
			</div>
		</Dialog>
	);
}

export default LicensingPromptDialog;
