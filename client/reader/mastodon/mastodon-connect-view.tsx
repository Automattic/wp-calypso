import { useAuthorizeMastodonConnectionMutation } from '@automattic/api-queries';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ConnectForm } from './connect-form';
import { saveOauthState } from './oauth-state';

export function MastodonConnectView() {
	const translate = useTranslate();
	const authorize = useAuthorizeMastodonConnectionMutation();

	const handleSubmit = ( { instance }: { instance: string } ) => {
		authorize.mutate(
			{ instance },
			{
				onSuccess: ( { authorize_url, state } ) => {
					saveOauthState( { state, instance } );
					window.location.assign( authorize_url );
				},
			}
		);
	};

	return (
		<ReaderMain className="mastodon-view">
			<DocumentHead title={ translate( 'Connect account ‹ Mastodon ‹ Reader' ) } />
			<NavigationHeader
				title={ translate( 'Connect a Mastodon account' ) }
				subtitle={ translate(
					'Enter your server’s address — we’ll hand you off to sign in there.'
				) }
			/>
			<VStack spacing={ 4 } className="mastodon-view__body">
				<ConnectForm
					isSubmitting={ authorize.isPending }
					error={ authorize.error ?? null }
					onSubmit={ handleSubmit }
				/>
			</VStack>
		</ReaderMain>
	);
}

export default MastodonConnectView;
