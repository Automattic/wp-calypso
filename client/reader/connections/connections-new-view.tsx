import { isEnabled } from '@automattic/calypso-config';
import { Card, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import { ReaderBlueskyIcon } from 'calypso/reader/components/icons/bluesky-icon';
import { ReaderFediverseIcon } from 'calypso/reader/components/icons/fediverse-icon';
import { ReaderMastodonIcon } from 'calypso/reader/components/icons/mastodon-icon';
import ReaderMain from 'calypso/reader/components/reader-main';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

interface ProtocolOption {
	key: 'atmosphere' | 'mastodon' | 'fediverse';
	label: string;
	description: string;
	href: string | null;
	icon: JSX.Element;
	available: boolean;
}

/**
 * Chooser surface for connecting a new account. The three cards mirror
 * the per-protocol entry points; clicking one forwards to the existing
 * protocol-specific connect view, which still owns the actual OAuth /
 * app-password / detection flow.
 *
 * Fediverse has no user-driven OAuth — connections appear automatically
 * when a wpcom user enables the ActivityPub plugin on one of their
 * sites. We surface a non-actionable explainer card in that case so the
 * three protocols remain visually consistent.
 */
export function ConnectionsNewView() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const socialEnabled = isEnabled( 'reader/social' );
	const fediverseEnabled = isEnabled( 'reader/fediverse' );

	const options: ProtocolOption[] = [
		{
			key: 'atmosphere',
			label: 'Bluesky',
			description: String(
				translate( 'Read your Bluesky timeline, reply, like, and repost from the Reader.' )
			),
			href: '/reader/atmosphere/connect',
			icon: <ReaderBlueskyIcon />,
			available: socialEnabled,
		},
		{
			key: 'mastodon',
			label: 'Mastodon',
			description: String(
				translate( 'Sign in to your Mastodon instance to bring your feed into the Reader.' )
			),
			href: '/reader/mastodon/connect',
			icon: <ReaderMastodonIcon />,
			available: socialEnabled,
		},
		{
			key: 'fediverse',
			label: 'Fediverse',
			description: String(
				translate(
					'Enable the ActivityPub plugin on a WordPress site you own to have it appear here.'
				)
			),
			href: null,
			icon: <ReaderFediverseIcon />,
			available: fediverseEnabled,
		},
	];

	const visibleOptions = options.filter( ( option ) => option.available );

	const handleClick = ( option: ProtocolOption ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_connections_new_protocol_clicked', {
				protocol: option.key,
			} )
		);
	};

	return (
		<ReaderMain className="connections-view">
			<DocumentHead title={ translate( 'Add an account ‹ Social ‹ Reader' ) } />
			<NavigationHeader
				title={ translate( 'Add a social account' ) }
				subtitle={ translate(
					'Bring an account from another network into the Reader. Pick where it lives.'
				) }
			/>
			<VStack spacing={ 3 } className="connections-new__cards">
				{ visibleOptions.map( ( option ) => {
					const card = (
						<Card className="connections-new__card" elevation={ 0 }>
							<div className="connections-new__card-icon" aria-hidden="true">
								{ option.icon }
							</div>
							<div className="connections-new__card-body">
								<h3 className="connections-new__card-label">{ option.label }</h3>
								<p className="connections-new__card-description">{ option.description }</p>
							</div>
						</Card>
					);

					if ( option.href ) {
						return (
							<a
								key={ option.key }
								href={ option.href }
								className="connections-new__card-link"
								onClick={ () => handleClick( option ) }
							>
								{ card }
							</a>
						);
					}

					return (
						<div key={ option.key } className="connections-new__card-link is-info">
							{ card }
						</div>
					);
				} ) }
			</VStack>
		</ReaderMain>
	);
}

export default ConnectionsNewView;
