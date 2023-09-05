import { Popover, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_DASHBOARD_WPCOM_HOSTING_FEATURE_TOOLTIP_PREFERENCE as tooltipPreference,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { PreferenceType } from '../../sites-overview/types';

import './style.scss';

type Props = {
	context: HTMLElement | null;
	isVisible: boolean;
};

export default function WPCOMHostingPopover( { context, isVisible }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const preference = useSelector( ( state ) => getPreference( state, tooltipPreference ) );

	const isDismissed = preference?.dismiss;

	const savePreferenceType = useCallback(
		( type: PreferenceType ) => {
			dispatch( savePreference( tooltipPreference, { ...preference, [ type ]: true } ) );
		},
		[ dispatch, preference ]
	);

	const handleClick = () => {
		savePreferenceType( 'dismiss' );
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_dashboard_wpcom_hosting_feature_popover_accept' )
		);
	};

	const handleOnShow = () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_dashboard_wpcom_hosting_feature_popover_view' )
		);
	};

	// Don't show the popover if the user has dismissed it
	if ( isDismissed ) {
		return null;
	}

	return (
		<Popover
			className="wpcom-hosting-popover"
			context={ context }
			isVisible={ isVisible }
			position="bottom"
			showDelay={ 300 }
			onShow={ handleOnShow }
		>
			<h2 className="wpcom-hosting-popover__heading">{ translate( 'New Feature!' ) }</h2>

			<p className="wpcom-hosting-popover__description">
				{ translate(
					'You can now create a WordPress.com site directly from Jetpack Manage. Give it a try!'
				) }
				<span className="wpcom-hosting-popover__icon">&#128640;</span>
			</p>

			<Button className="wpcom-hosting-popover__button" onClick={ handleClick }>
				{ translate( 'Got it' ) }
			</Button>
		</Popover>
	);
}
