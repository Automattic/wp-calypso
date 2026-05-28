import { useFediverseConnectionsQuery } from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	Button,
	Card,
	ComboboxControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
import { ReaderBlueskyIcon } from 'calypso/reader/components/icons/bluesky-icon';
import { ReaderFediverseIcon } from 'calypso/reader/components/icons/fediverse-icon';
import { ReaderMastodonIcon } from 'calypso/reader/components/icons/mastodon-icon';
import ReaderMain from 'calypso/reader/components/reader-main';
import { type ConnectionProtocol } from 'calypso/reader/sidebar/reader-sidebar-connections/types';
import { useDispatch, useSelector } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSites from 'calypso/state/selectors/get-sites';

type SiteEntry = NonNullable< ReturnType< typeof getSites >[ number ] >;
type AdminSite = SiteEntry & { capabilities: { manage_options: true } };

function isAdminSite( site: SiteEntry | null | undefined ): site is AdminSite {
	return !! site && site.capabilities?.manage_options === true;
}

function getActivityPubSettingsUrl( site: AdminSite ): string | null {
	const adminUrl = site.options?.admin_url;
	return adminUrl ? `${ adminUrl }options-general.php?page=activitypub` : null;
}

function FediverseSitePicker( {
	sites,
	primarySiteId,
	onOpen,
}: {
	sites: AdminSite[];
	primarySiteId: number | null;
	onOpen: ( site: AdminSite ) => void;
} ) {
	const translate = useTranslate();

	const [ selectedSiteId, setSelectedSiteId ] = useState< number >( () => {
		if ( primarySiteId && sites.some( ( s ) => s.ID === primarySiteId ) ) {
			return primarySiteId;
		}
		return sites[ 0 ]?.ID ?? 0;
	} );

	const options = useMemo(
		() =>
			sites.map( ( s ) => ( {
				value: String( s.ID ),
				label: s.name || s.URL || String( s.ID ),
			} ) ),
		[ sites ]
	);

	// Callers gate on `adminSites.length > 1`; this guard documents the
	// invariant locally so the `sites[ 0 ]` reads below can't TypeError
	// if the gate ever drifts.
	if ( sites.length === 0 ) {
		return null;
	}

	const selectedSite = sites.find( ( s ) => s.ID === selectedSiteId );
	if ( ! selectedSite ) {
		return null;
	}
	const href = getActivityPubSettingsUrl( selectedSite );

	return (
		<div className="connections-new__card-picker">
			<ComboboxControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				className="connections-new__card-picker-combobox"
				label={ String( translate( 'Choose a site' ) ) }
				value={ String( selectedSiteId ) }
				onChange={ ( newValue ) => {
					const parsed = newValue ? Number( newValue ) : NaN;
					if ( Number.isInteger( parsed ) && sites.some( ( s ) => s.ID === parsed ) ) {
						setSelectedSiteId( parsed );
					}
				} }
				options={ options }
				allowReset={ false }
			/>
			<Button
				variant="primary"
				__next40pxDefaultSize
				className="connections-new__card-picker-cta"
				href={ href ?? undefined }
				target="_blank"
				rel="noopener noreferrer"
				disabled={ ! href }
				onClick={ () => onOpen( selectedSite ) }
			>
				{ translate( 'Open ActivityPub settings' ) }
			</Button>
		</div>
	);
}

interface ProtocolOption {
	key: ConnectionProtocol;
	label: string;
	tagline: string;
	body: string;
	href: string | null;
	/** Open the primary link in a new tab — used for off-Calypso destinations like wp-admin. */
	hrefExternal?: boolean;
	docHref: string;
	docLabel: string;
	icon: JSX.Element;
}

/**
 * Chooser surface for connecting a new account. Three cards mirror
 * the per-protocol entry points; the primary action navigates into
 * each protocol's existing connect view, which still owns the actual
 * OAuth / app-password flow.
 *
 * Ordering is intentional: Fediverse first because a WordPress.com user
 * "already has a fediverse account" — they just need to flip a switch on
 * their own site. We surface that nudge as a quirky "start here"
 * recommendation; the other two cards then introduce Bluesky and
 * Mastodon for users who already live there.
 *
 * The Fediverse card adapts its copy and primary action to the caller's
 * state:
 *   - already federating  → point at the existing entry in the sidebar
 *   - exactly one admin site → deep-link straight into that site's
 *     wp-admin ActivityPub settings
 *   - multiple admin sites → inline site picker + CTA that deep-links into
 *     Settings › ActivityPub for the chosen site
 *   - no admin site → original explainer copy (no primary link)
 */
export function ConnectionsNewView() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const fediverseConnectionsQuery = useFediverseConnectionsQuery();
	const hasFediverseConnection = ( fediverseConnectionsQuery.data?.connections?.length ?? 0 ) > 0;

	const adminSites = useSelector( ( state ) => getSites( state ).filter( isAdminSite ) );
	const primarySiteId = useSelector( getPrimarySiteId );

	const fediverseDocHref = localizeUrl( 'https://wordpress.com/support/enter-the-fediverse/' );
	const blueskyDocHref = localizeUrl( 'https://wordpress.com/support/reader/social/' );
	const mastodonDocHref = localizeUrl( 'https://wordpress.com/support/reader/social/' );
	const learnMoreLabel = String( translate( 'Learn more' ) );

	const fediverse: ProtocolOption = ( () => {
		const base = {
			key: 'fediverse' as const,
			label: 'Fediverse',
			icon: <ReaderFediverseIcon viewBox="4 3 16 18" />,
			docHref: fediverseDocHref,
			docLabel: learnMoreLabel,
		};

		if ( hasFediverseConnection ) {
			return {
				...base,
				tagline: String( translate( 'You’re already on the Fediverse.' ) ),
				body: String(
					translate(
						'Your WordPress site is already federating. Look for it in the sidebar to jump into your timeline.'
					)
				),
				href: null,
			};
		}

		if ( adminSites.length === 1 ) {
			const href = getActivityPubSettingsUrl( adminSites[ 0 ] );
			return {
				...base,
				tagline: String( translate( 'Your WordPress site is already social.' ) ),
				body: String(
					translate(
						'Flip the ActivityPub switch in your site’s settings, and your blog slots in next to everything else you read here.'
					)
				),
				href,
				hrefExternal: !! href,
			};
		}

		if ( adminSites.length > 1 ) {
			return {
				...base,
				tagline: String( translate( 'Your WordPress site is already social.' ) ),
				body: String(
					translate(
						'Pick the site you want to bring along, and we’ll take you straight to its ActivityPub settings.'
					)
				),
				href: null,
			};
		}

		return {
			...base,
			tagline: String( translate( 'Your WordPress site is already social.' ) ),
			body: String(
				translate(
					'If you have a WordPress.com site, you already have a home on the open social web. Flip the ActivityPub switch on your blog and it shows up here.'
				)
			),
			href: null,
		};
	} )();

	const atmosphere: ProtocolOption = {
		key: 'atmosphere',
		label: 'Bluesky',
		tagline: String( translate( 'Already on Bluesky? Bring it over.' ) ),
		body: String(
			translate(
				'Plug your Bluesky handle in and your timeline shows up here, ready to scroll and reply to without leaving the Reader. Works with bsky.social or any other ATproto server.'
			)
		),
		href: '/reader/atmosphere/connect',
		icon: <ReaderBlueskyIcon filled viewBox="2 3 20 18" />,
		docHref: blueskyDocHref,
		docLabel: learnMoreLabel,
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
		icon: <ReaderMastodonIcon viewBox="0 0 74 78" />,
		docHref: mastodonDocHref,
		docLabel: learnMoreLabel,
	};

	const options: ProtocolOption[] = [ fediverse, atmosphere, mastodon ];

	const handlePrimaryClick = ( option: ProtocolOption ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_connections_new_protocol_clicked', {
				protocol: option.key,
			} )
		);
	};

	const handleDocClick = ( option: ProtocolOption ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_connections_new_doc_clicked', {
				protocol: option.key,
			} )
		);
	};

	const handleFediversePickerOpen = ( site: AdminSite ) => {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_connections_new_protocol_clicked', {
				protocol: 'fediverse',
				site_id: site.ID,
				source: 'site_picker',
			} )
		);
	};

	// Hold the picker until the connections query *succeeds*. Without this gate
	// a user who already federates would see the picker flash in on first paint,
	// then disappear once the query resolves and the card flips to "already
	// federating". Gating on `isSuccess` (rather than `!isPending`) also keeps
	// the picker hidden when the query errors — drawing protocol-state UI from a
	// failed query would mislead an already-federating user into wp-admin.
	const showFediversePicker =
		fediverseConnectionsQuery.isSuccess && ! hasFediverseConnection && adminSites.length > 1;

	return (
		<ReaderMain className="connections-view">
			<DocumentHead title={ translate( 'Add an account ‹ Social ‹ Reader' ) } />
			<NavigationHeader
				title={ translate( 'Add a social account' ) }
				subtitle={ translate(
					'Pick where your other social home lives. Or start one from the WordPress site you already have.'
				) }
			/>
			<VStack spacing={ 3 } className="connections-new__cards">
				{ options.map( ( option, index ) => {
					const featured = option.key === 'fediverse' && index === 0;
					const externalProps = option.hrefExternal
						? { target: '_blank', rel: 'noopener noreferrer' }
						: {};

					return (
						<Card
							key={ option.key }
							className={ `connections-new__card connections-new__card--${ option.key }${
								option.href ? ' has-link' : ''
							}${ featured ? ' is-featured' : '' }` }
							elevation={ 0 }
						>
							{ featured && (
								<div className="connections-new__card-badge">
									{ translate( 'Recommended for WordPress folks' ) }
								</div>
							) }
							<div className="connections-new__card-heading">
								<div className="connections-new__card-icon" aria-hidden="true">
									{ option.icon }
								</div>
								<h3 className="connections-new__card-label">
									{ option.href ? (
										<a
											className="connections-new__card-link"
											href={ option.href }
											onClick={ () => handlePrimaryClick( option ) }
											{ ...externalProps }
										>
											{ option.label }
										</a>
									) : (
										option.label
									) }
								</h3>
							</div>
							<p className="connections-new__card-tagline">{ option.tagline }</p>
							<p className="connections-new__card-description">{ option.body }</p>
							{ option.key === 'fediverse' && showFediversePicker && (
								<FediverseSitePicker
									sites={ adminSites }
									primarySiteId={ primarySiteId }
									onOpen={ handleFediversePickerOpen }
								/>
							) }
							<a
								className="connections-new__card-doc"
								href={ option.docHref }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ () => handleDocClick( option ) }
							>
								{ option.docLabel }
								<span aria-hidden="true"> ↗</span>
							</a>
						</Card>
					);
				} ) }
			</VStack>
			<p className="connections-new__footnote">
				{ translate(
					'Connecting a network doesn’t move your data. It just lets the Reader peek into your accounts on your behalf.'
				) }
			</p>
		</ReaderMain>
	);
}

export default ConnectionsNewView;
