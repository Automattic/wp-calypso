import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';

export const Subscribers = () => {
	const isSubscribersPageEnabled = config.isEnabled( 'subscribers-page' );

	if ( ! isSubscribersPageEnabled ) {
		return null;
	}

	return (
		<Main className="subscribers">
			<DocumentHead title={ translate( 'Subscribers' ) } />
			Subscribers
		</Main>
	);
};
