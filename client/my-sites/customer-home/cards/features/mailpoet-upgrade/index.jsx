import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Card, Gridicon, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

export default function MailPoetUpgrade() {
	const selectedSite = useSelector( getSelectedSite );

	const dismissPreference = `calypso_my_home_mailpoet_upgrade_dismiss-${ selectedSite?.ID }`;
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	const shouldNotShowCard = ! hasPreferences || isDismissed;

	if ( shouldNotShowCard ) {
		return null;
	}

	return <RenderMailPoetUpgrade dismissPreference={ dismissPreference } />;
}

export function RenderMailPoetUpgrade( { dismissPreference } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const getDismissClickHandler = () => {
		recordTracksEvent( 'calypso_my_home_mailpoet_upgrade_dismiss_click' );
		dispatch( savePreference( dismissPreference, true ) );
	};

	return (
		<Card className="mailpoet-upgrade__card">
			<TrackComponentView eventName="calypso_my_home_mailpoet_upgrade_impression" />

			<div>
				<div className="mailpoet-upgrade__card-dismiss">
					<button
						aria-label={ translate( 'Dismiss mailpoet upgrade modal' ) }
						onClick={ getDismissClickHandler }
					>
						<Gridicon icon="cross" width={ 18 } />
					</button>
				</div>
				<h3>{ translate( 'Get a Free MailPoet Subscription' ) }</h3>
				<p>
					{ translate(
						'The eCommerce plan subscription provides a complimentary MailPoet Business Subscription, allowing you to send visually appealing emails that consistently land in inboxes and cultivate a loyal subscriber base.'
					) }
				</p>
				<div className="mailpoet-upgrade-actions">
					<Button primary>{ translate( 'Get it now' ) }</Button>
					<Button onClick={ getDismissClickHandler }>{ translate( "No, I'm Ok" ) }</Button>
				</div>
			</div>
		</Card>
	);
}
