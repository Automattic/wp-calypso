import { useCreateMastodonConnectionMutation } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ConnectForm } from './connect-form';

export function MastodonConnectView() {
	const translate = useTranslate();
	const create = useCreateMastodonConnectionMutation();

	const handleSubmit = ( values: { instance: string; handle: string; access_token: string } ) => {
		create.mutate( values, {
			onSuccess: ( response ) => {
				page( `/reader/mastodon/${ response.connection.id }/timeline` );
			},
		} );
	};

	return (
		<ReaderMain className="mastodon-view">
			<DocumentHead title={ translate( 'Connect account ‹ Mastodon ‹ Reader' ) } />
			<NavigationHeader
				title={ translate( 'Connect a Mastodon account' ) }
				subtitle={ translate( 'Bring your Mastodon account into the Reader.' ) }
			/>
			<VStack spacing={ 4 } className="mastodon-view__body">
				<ConnectForm
					isSubmitting={ create.isPending }
					error={ create.error ?? null }
					onSubmit={ handleSubmit }
				/>
			</VStack>
		</ReaderMain>
	);
}

export default MastodonConnectView;
