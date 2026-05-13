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

type ProtocolKey = 'fediverse' | 'atmosphere' | 'mastodon';

interface ProtocolOption {
	key: ProtocolKey;
	label: string;
	tagline: string;
	body: string;
	href: string | null;
	icon: JSX.Element;
	available: boolean;
}

/**
 * Chooser surface for connecting a new account. Three cards mirror
 * the per-protocol entry points; clicking one forwards to the existing
 * protocol-specific connect view, which still owns the actual OAuth /
 * app-password flow.
 *
 * Ordering is intentional: Fediverse first because a WordPress.com user
 * "already has a fediverse account" — they just need to flip a switch on
 * their own site. We surface that nudge as a quirky "start here"
 * recommendation; the other two cards then introduce Bluesky and
 * Mastodon for users who already live there.
 *
 * Copy leans warm and a bit playful — the network names alone aren't
 * enough for a first-time user to know what they're choosing between,
 * so the body lines do double-duty as primer + recommendation.
 */
export function ConnectionsNewView() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const socialEnabled = isEnabled( 'reader/social' );
	const fediverseEnabled = isEnabled( 'reader/fediverse' );

	const fediverse: ProtocolOption = {
		key: 'fediverse',
		label: 'Fediverse',
		tagline: String( translate( 'Start here — your site is already social.' ) ),
		body: String(
			translate(
				'If you have a WordPress.com site, you already have a home on the open social web. Flip the ActivityPub switch on your blog and it shows up here — nothing to sign up for, since your site already does the talking.'
			)
		),
		href: null,
		icon: <ReaderFediverseIcon />,
		available: fediverseEnabled,
	};

	const atmosphere: ProtocolOption = {
		key: 'atmosphere',
		label: 'Bluesky',
		tagline: String( translate( 'Already on Bluesky? Bring it over.' ) ),
		body: String(
			translate(
				'Plug your bsky.social handle in and your Bluesky timeline shows up here, ready to scroll and reply to without leaving the Reader.'
			)
		),
		href: '/reader/atmosphere/connect',
		icon: <ReaderBlueskyIcon filled />,
		available: socialEnabled,
	};

	const mastodon: ProtocolOption = {
		key: 'mastodon',
		label: 'Mastodon',
		tagline: String( translate( 'Got a Mastodon instance? Sign right in.' ) ),
		body: String(
			translate(
				'Tell us which instance you live on, sign in once, and your Mastodon feed slots in next to everything else you read here.'
			)
		),
		href: '/reader/mastodon/connect',
		icon: <ReaderMastodonIcon />,
		available: socialEnabled,
	};

	const options: ProtocolOption[] = [ fediverse, atmosphere, mastodon ].filter(
		( option ) => option.available
	);

	const handleClick = ( option: ProtocolOption ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_connections_new_protocol_clicked', {
				protocol: option.key,
			} )
		);
	};

	return (
		<ReaderMain className="connections-view">
			<DocumentHead title={ translate( 'Add an account ‹ Pulse ‹ Reader' ) } />
			<NavigationHeader
				title={ translate( 'Add a social account' ) }
				subtitle={ translate(
					'Pick where your other social home lives — or start one from the WordPress site you already have.'
				) }
			/>
			<VStack spacing={ 3 } className="connections-new__cards">
				{ options.map( ( option, index ) => {
					const featured = option.key === 'fediverse' && index === 0;
					const card = (
						<Card
							className={ `connections-new__card connections-new__card--${ option.key }${
								featured ? ' is-featured' : ''
							}` }
							elevation={ 0 }
						>
							<div className="connections-new__card-icon" aria-hidden="true">
								{ option.icon }
							</div>
							<div className="connections-new__card-body">
								{ featured && (
									<div className="connections-new__card-badge">
										{ translate( 'Recommended for WordPress folks' ) }
									</div>
								) }
								<h3 className="connections-new__card-label">{ option.label }</h3>
								<p className="connections-new__card-tagline">{ option.tagline }</p>
								<p className="connections-new__card-description">{ option.body }</p>
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
			<p className="connections-new__footnote">
				{ translate(
					'Connecting a network doesn’t move your data — it just lets the Reader peek into your accounts on your behalf. Disconnect any time.'
				) }
			</p>
		</ReaderMain>
	);
}

export default ConnectionsNewView;
