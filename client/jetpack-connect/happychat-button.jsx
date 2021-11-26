import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import HappychatButton from 'calypso/components/happychat/button';
import HappychatConnection from 'calypso/components/happychat/connection-connected';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';

const JetpackConnectHappychatButton = ( {
	label,
	eventName = 'calypso_jpc_chat_initiated',
	children,
} ) => {
	const translate = useTranslate();
	const isChatAvailable = useSelector( isHappychatAvailable );
	const isChatActive = useSelector( hasActiveHappychatSession );
	const isLoggedIn = useSelector( isUserLoggedIn );

	if ( ! isLoggedIn ) {
		return <div>{ children }</div>;
	}

	if ( ! isChatAvailable && ! isChatActive ) {
		return (
			<div>
				<HappychatConnection />
				{ children }
			</div>
		);
	}

	return (
		<HappychatButton
			borderless={ false }
			className="logged-out-form__link-item jetpack-connect__happychat-button"
			onClick={ () => recordTracksEvent( eventName ) }
		>
			<HappychatConnection />
			<Gridicon icon="chat" size={ 18 } /> { label || translate( 'Get help setting up Jetpack' ) }
		</HappychatButton>
	);
};

JetpackConnectHappychatButton.propTypes = {
	eventName: PropTypes.string,
	label: PropTypes.string,
};

export default JetpackConnectHappychatButton;
