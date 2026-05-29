import { useAuthorizeMastodonConnectionMutation } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { ReaderMastodonIcon } from 'calypso/reader/components/icons/mastodon-icon';
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

type StartError = 'unsafe_url' | 'state_persist_failed';

export function MastodonConnectView() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const authorize = useAuthorizeMastodonConnectionMutation();
	const [ startError, setStartError ] = useState< StartError | null >( null );

	const handleSubmit = ( { instance }: { instance: string } ) => {
		setStartError( null );
		authorize.mutate(
			{ instance },
			{
				onSuccess: ( { authorize_url, state } ) => {
					if ( ! isSafeAuthorizeUrl( authorize_url ) ) {
						// Refuse to follow an off-scheme URL. Backend should only
						// ever return `https:`; anything else is a bug or tampering.
						// Surface a user-visible error so the form doesn't appear
						// to hang silently after Continue.
						setStartError( 'unsafe_url' );
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_mastodon_authorize_error', {
								reason: 'unsafe_url',
							} )
						);
						return;
					}
					if ( ! saveOauthState( { state, instance } ) ) {
						// sessionStorage was unavailable. Without persisted state
						// the callback view can't validate `state` on return, so
						// the redirect would always end at "expired link" after
						// the user signed in on the IdP — surface the failure now.
						setStartError( 'state_persist_failed' );
						dispatch(
							recordReaderTracksEvent( 'calypso_reader_mastodon_authorize_error', {
								reason: 'state_persist_failed',
							} )
						);
						return;
					}
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
				title={
					<span className="mastodon-view__section-title">
						<span data-testid="mastodon-section-logo" aria-hidden="true">
							<ReaderMastodonIcon />
						</span>
						<span>{ translate( 'Connect a Mastodon account' ) }</span>
					</span>
				}
				subtitle={ translate( 'Bring your Mastodon account into the Reader.' ) }
			/>
			<VStack spacing={ 4 } className="mastodon-view__body">
				<ConnectForm
					isSubmitting={ authorize.isPending }
					error={ authorize.error ?? null }
					onSubmit={ handleSubmit }
				/>
				{ startError === 'unsafe_url' ? (
					<p className="mastodon-error" role="alert">
						{ translate(
							'We couldn’t start the authorization safely. Please try again, or choose a different instance.'
						) }
					</p>
				) : null }
				{ startError === 'state_persist_failed' ? (
					<p className="mastodon-error" role="alert">
						{ translate(
							'We couldn’t save the sign-in details in your browser. Make sure cookies and site storage are enabled, then try again.'
						) }
					</p>
				) : null }
				<p className="mastodon-view__learn-more">
					<InlineSupportLink
						supportPostId={ 439167 }
						supportLink={ localizeUrl( 'https://wordpress.com/support/reader/social/' ) }
						onClick={ () =>
							dispatch( recordReaderTracksEvent( 'calypso_reader_mastodon_learn_more_clicked' ) )
						}
						showIcon={ false }
						noWrap={ false }
					>
						{ translate( 'Learn more about your social accounts in the Reader' ) }
					</InlineSupportLink>
				</p>
			</VStack>
		</ReaderMain>
	);
}

export default MastodonConnectView;
