import { Button } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_DASHBOARD_CHECKOUT_REDIRECT_MODAL_DISMISSED as preferenceName,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { setPreference } from 'calypso/state/preferences/actions';
import { CheckIcon } from '../check-icon';

import './style.scss';

interface Props {
	redirectTo?: string;
	productSourceFromUrl?: string;
}

export default function JetpackProRedirectModal( { redirectTo, productSourceFromUrl }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isDismissed = useSelector( ( state ) => getPreference( state, preferenceName ) );

	// Function to set the preference to dismiss the modal and record the event.
	const dismissAndRecordEvent = () => {
		dispatch( setPreference( preferenceName, true ) );
		dispatch( recordTracksEvent( 'jetpack_dashboard_agency_checkout_redirect_modal_dismiss' ) );
	};

	// Function to record the event when the user clicks on the redirect button.
	const recordRedirectEvent = () => {
		dispatch( recordTracksEvent( 'jetpack_dashboard_agency_checkout_redirect_modal_redirect' ) );
	};

	// Features list of Jetpack Manage.
	const features = [
		translate( 'Up to 60% off our products and bundles.' ),
		translate( 'A recurring discount (not just for the first year).' ),
		translate( 'More flexible billing (only pay per day of use, billed monthly).' ),
		translate( 'Access to Jetpack Manage – manage all of your sites in one place.' ),
	];

	const redirectURLPage = getQueryArg( redirectTo ?? '', 'page' );

	const isAgencyPartner = useSelector( isAgencyUser );

	const isJetpackSource =
		productSourceFromUrl === 'jetpack-plans' ||
		redirectURLPage === 'my-jetpack' ||
		redirectURLPage === 'jetpack';

	// Function to record the event when the modal is displayed.
	// It is in a separate useEffect to avoid unecessary re-renders.
	useEffect( () => {
		if ( isAgencyPartner && ! isDismissed && isJetpackSource ) {
			dispatch( recordTracksEvent( 'jetpack_dashboard_agency_checkout_redirect_modal_show' ) );
		}
		// We only want to run this once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Show the banner only if the user is agency partner, has not dismissed the banner and
	// is coming from the Jetpack Plans page or Jetpack page in WP.com
	if ( ! isAgencyPartner || isDismissed || ! isJetpackSource ) {
		return null;
	}

	return (
		<Modal onRequestClose={ dismissAndRecordEvent } title="" className="jetpack-pro-redirect-modal">
			<div className="jetpack-pro-redirect-modal__container">
				<div className="jetpack-pro-redirect-modal__top-header">
					<JetpackLogo size={ 22 } className="jetpack-pro-redirect-modal__logo" />
					{ translate( 'For Agencies & Pros' ) }
				</div>
				<div className="jetpack-pro-redirect-modal__content">
					<div className="jetpack-pro-redirect-modal__heading">
						{ translate( 'Get a recurring discount and more flexible billing' ) }
					</div>
					<p>
						{ translate(
							'As a Jetpack partner, by purchasing products through our Agency & Pro tools, you get:'
						) }
					</p>
					<ul className="jetpack-pro-redirect-modal__list">
						{ features.map( ( feature ) => {
							const id = feature.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase();
							return (
								<li key={ id }>
									<CheckIcon />
									{ feature }
								</li>
							);
						} ) }
					</ul>
				</div>
				<div className="jetpack-pro-redirect-modal__footer">
					<div className="jetpack-pro-redirect-modal__footer-buttons">
						<Button
							type="submit"
							primary
							href="https://cloud.jetpack.com/partner-portal/issue-license"
							onClick={ recordRedirectEvent }
						>
							{ translate( 'Unlock savings now' ) }
						</Button>
						<Button borderless onClick={ dismissAndRecordEvent }>
							{ translate( 'Continue with purchase here' ) }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
