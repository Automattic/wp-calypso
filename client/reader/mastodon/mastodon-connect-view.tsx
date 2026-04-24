import { useAuthorizeMastodonConnectionMutation } from '@automattic/api-queries';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { ConnectForm } from './connect-form';
import { saveOauthState } from './oauth-state';

function isSafeAuthorizeUrl( url: string ): boolean {
	try {
		const parsed = new URL( url );
		return parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export function MastodonConnectView() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const authorize = useAuthorizeMastodonConnectionMutation();

	const handleSubmit = ( { instance }: { instance: string } ) => {
		authorize.mutate(
			{ instance },
			{
				onSuccess: ( { authorize_url, state } ) => {
					if ( ! isSafeAuthorizeUrl( authorize_url ) ) {
						// Refuse to follow an off-scheme URL. Backend should only
						// ever return `https:`; anything else is a bug or tampering.
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_mastodon_authorize_error', {
								reason: 'unsafe_url',
							} )
						);
						return;
					}
					saveOauthState( { state, instance } );
					window.location.assign( authorize_url );
				},
				onError: ( error ) => {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_mastodon_authorize_error', {
							reason: 'authorize_failed',
							error_kind: error.kind,
						} )
					);
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
