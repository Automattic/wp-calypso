import { useCreateConnectionMutation } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import { ReaderBlueskyIcon } from 'calypso/reader/components/icons/bluesky-icon';
import ReaderMain from 'calypso/reader/components/reader-main';
import { ConnectForm } from './connect-form';

export function AtmosphereConnectView() {
	const translate = useTranslate();
	const create = useCreateConnectionMutation();

	const handleSubmit = ( values: { handle: string; app_password: string } ) => {
		create.mutate( values, {
			onSuccess: ( response ) => {
				page( `/reader/atmosphere/${ response.connection.id }/timeline` );
			},
		} );
	};

	const title = (
		<span className="atmosphere-view__section-title">
			<span data-testid="atmosphere-section-logo" aria-hidden="true">
				<ReaderBlueskyIcon />
			</span>
			<span>{ translate( 'Connect a Bluesky account' ) }</span>
		</span>
	);

	return (
		<ReaderMain className="atmosphere-view">
			<DocumentHead title={ translate( 'Connect account ‹ ATmosphere ‹ Reader' ) } />
			<NavigationHeader
				title={ title }
				subtitle={ translate(
					'Bring your Bluesky account into the Reader, from bsky.social or any other ATproto server.'
				) }
			/>
			<VStack spacing={ 4 } className="atmosphere-view__body">
				<ConnectForm
					isSubmitting={ create.isPending }
					error={ create.error ?? null }
					onSubmit={ handleSubmit }
				/>
				<p className="atmosphere-view__learn-more">
					<ExternalLink href={ localizeUrl( 'https://wordpress.com/support/reader/social/' ) }>
						{ translate( 'Learn more about your social accounts in the Reader' ) }
					</ExternalLink>
				</p>
			</VStack>
		</ReaderMain>
	);
}

export default AtmosphereConnectView;
