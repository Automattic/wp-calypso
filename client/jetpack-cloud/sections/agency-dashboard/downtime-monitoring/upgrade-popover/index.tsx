import { Popover, Button } from '@automattic/components';
import { close, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import {
	JETPACK_DASHBOARD_DOWNTIME_MONITORING_UPGRADE_TOOLTIP_PREFERENCE as tooltipPreference,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { PreferenceType } from '../../sites-overview/types';

import './style.scss';

type Props = {
	context: HTMLElement | null;
	isVisible: boolean;
	position?: string;
	onClose?: () => void;
};

export default function UpgradePopover( { context, isVisible, position, onClose }: Props ) {
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

	const handleDismissPopover = () => {
		onClose?.();
		savePreferenceType( 'dismiss' );
	};

	const handleClose = () => {
		handleDismissPopover();
		// TODO: Add event tracking here
	};

	const handleClickExplore = () => {
		handleDismissPopover();
		// TODO: Add event tracking here
		// TODO: Hanle show upgrade modal
	};

	// Don't show the popover if the user has dismissed it
	if ( isDismissed ) {
		return null;
	}

	return (
		<Popover
			className="upgrade-popover"
			context={ context }
			isVisible={ isVisible }
			position={ position }
		>
			<h2 className="upgrade-popover__heading">{ translate( 'Maximise uptime' ) }</h2>
			<Button borderless className="upgrade-popover__close-button">
				<Icon icon={ close } onClick={ handleClose } size={ 16 } />
			</Button>

			<ul className="upgrade-popover__list">
				<li>{ translate( '1 minute monitoring interval' ) }</li>
				<li>{ translate( 'SMS Notifications' ) }</li>
				<li>{ translate( 'Multiple email recipients' ) }</li>
			</ul>
			<Button className="upgrade-popover__button" primary onClick={ handleClickExplore }>
				{ translate( 'Explore' ) }
			</Button>
		</Popover>
	);
}
