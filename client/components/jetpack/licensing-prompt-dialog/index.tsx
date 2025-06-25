import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { JPC_PATH_PLANS } from 'calypso/jetpack-connect/constants';
import { useDispatch, useSelector } from 'calypso/state';
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
	const jetpackDashboardUrl = siteAdminUrl + 'admin.php?page=my-jetpack#/add-license';

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

	let titleToRender = window.location.pathname.startsWith( JPC_PATH_PLANS )
		? translate( 'Activate your license for this site' )
		: '';

	if ( ! titleToRender ) {
		if ( hasOneDetachedLicense ) {
			titleToRender = detachedUserLicense?.product
				? String(
						translate( 'Activate %(productName)s', {
							args: {
								productName: detachedUserLicense.product,
							},
						} )
				  )
				: translate( 'Your product is pending activation' );
		} else {
			titleToRender = translate( 'Activate your new Jetpack features' );
		}
	}

	const instructions = (
		<>
			<b>
				{ hasOneDetachedLicense && detachedUserLicense?.product
					? translate(
							'You have a %(productName)s license available. You can activate it now if you want.',
							{
								args: {
									productName: detachedUserLicense?.product,
								},
							}
					  )
					: translate(
							'You have licenses available for some Jetpack features. You can activate them now if you want.'
					  ) }
			</b>
			<ul>
				<li>
					{ translate( 'You can find the license keys in your purchase confirmation email.' ) }
				</li>
				<li>
					{ translate( 'Or in {{purchases/}}', {
						components: {
							purchases: (
								<Button className="user-purchases-link" href="/me/purchases" target="_blank" plain>
									https://wordpress.com/me/purchases
								</Button>
							),
						},
					} ) }
				</li>
			</ul>
		</>
	);

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
			additionalOverlayClassNames="licensing-prompt-dialog__backdrop"
			isVisible={ showLicensesDialog }
			onClose={ closeDialog }
			shouldCloseOnEsc
		>
			<h1 className="licensing-prompt-dialog__title">{ titleToRender }</h1>
			<Gridicon
				className="licensing-prompt-dialog__close"
				icon="cross-small"
				size={ 24 }
				onClick={ selectAnotherProductClick }
			/>
			<div className="licensing-prompt-dialog__instructions">{ instructions }</div>
			<div className="licensing-prompt-dialog__actions">
				<Button
					className="licensing-prompt-dialog__btn"
					primary
					href={ jetpackDashboardUrl }
					onClick={ activateProductClick }
				>
					{ translate( 'Activate now' ) }
				</Button>
				<Button className="licensing-prompt-dialog__btn" onClick={ selectAnotherProductClick }>
					{ translate( 'Select another product' ) }
				</Button>
			</div>
		</Dialog>
	);
}

export default LicensingPromptDialog;
