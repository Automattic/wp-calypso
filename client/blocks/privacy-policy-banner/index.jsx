import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import Banner from 'calypso/components/banner';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import wpcom from 'calypso/lib/wp';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import getCurrentUserRegisterDate from 'calypso/state/selectors/get-current-user-register-date';
import PrivacyPolicyDialog from './privacy-policy-dialog';

export default function PrivacyPolicyBanner() {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showDialog, setShowDialog ] = useState( false );

	const hasReceivedPreferences = useSelector( hasReceivedRemotePreferences );
	const preference = useSelector( ( state ) => getPreference( state, 'privacy-policy' ) );
	const userRegisterDate = useSelector( getCurrentUserRegisterDate );

	const { data: privacyPolicy } = useQuery( 'privacy-policy', () =>
		wpcom.req
			.get( { path: '/privacy-policy', apiNamespace: 'wpcom/v2' } )
			// extract the "automattic" policy from the list of entities and ignore the other ones
			.then( ( response ) => response.entities.automattic ?? null )
	);

	function shouldRender() {
		if ( ! hasReceivedPreferences || ! privacyPolicy ) {
			return false;
		}

		if ( config.isEnabled( 'privacy-policy/test' ) ) {
			return true;
		}

		// check if the user has already accepted/read the privacy policy.
		if ( preference?.[ privacyPolicy.id ] === true ) {
			return false;
		}

		// check if the current policy is under the notification period.
		const notifyFrom = moment.utc( privacyPolicy.notification_period.from );
		const notifyTo = moment.utc( privacyPolicy.notification_period.to );

		if ( ! moment().isBetween( notifyFrom, notifyTo ) ) {
			return false;
		}

		// check if the register date of the user is after the notification period
		if ( moment( userRegisterDate ).isAfter( notifyFrom ) ) {
			return false;
		}

		return true;
	}

	if ( ! shouldRender() ) {
		return null;
	}

	function openDialog() {
		setShowDialog( true );
	}

	function closeDialog() {
		setShowDialog( false );
		dispatch( savePreference( 'privacy-policy', { ...preference, [ privacyPolicy.id ]: true } ) );
	}

	const description = translate( "We're updating our privacy policy on %(date)s.", {
		args: { date: moment.utc( privacyPolicy.effective_date ).format( 'LL' ) },
	} );

	return (
		<>
			<Banner
				callToAction={ translate( 'Learn More' ) }
				description={ description }
				disableHref
				icon="pages"
				onClick={ openDialog }
				title={ translate( 'Privacy Policy Updates.' ) }
			/>
			{ showDialog && (
				<PrivacyPolicyDialog
					content={ privacyPolicy.content }
					title={ privacyPolicy.title }
					onClose={ closeDialog }
					onDismiss={ closeDialog }
				/>
			) }
		</>
	);
}
