import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
//import { useSubscribersQuery } from './queries';

export const Subscribers = () => {
	const isSubscribersPageEnabled = config.isEnabled( 'subscribers-page' );

	if ( ! isSubscribersPageEnabled ) {
		return null;
	}

	//const { data } = useSubscribersQuery(); // needs to be passed a siteId
	//console.log( 'data: ', data );

	return (
		<Main>
			<DocumentHead title={ translate( 'Subscribers' ) } />
			Subscribers
		</Main>
	);
};
