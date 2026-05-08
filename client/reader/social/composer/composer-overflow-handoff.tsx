import './composer-overflow-handoff.scss';

import { sitesQuery, userSettingsQuery } from '@automattic/api-queries';
import { useMutation, useQuery, type UseMutationResult } from '@tanstack/react-query';
import {
	Button,
	ComboboxControl,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { logToLogstash } from 'calypso/lib/logstash';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { useComposerConfig } from './composer-config';
import { useComposer } from './composer-provider';
import {
	saveDraftMutation,
	type SaveDraftMutationResult,
	type SaveDraftMutationVariables,
} from './use-save-draft-mutation';
import type { ActiveMode } from './composer-provider';
import type { Site } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

interface ComposerOverflowHandoffProps {
	text: string;
}

type SaveDraftMutate = UseMutationResult<
	SaveDraftMutationResult,
	Error,
	SaveDraftMutationVariables
>[ 'mutate' ];

function SingleSiteHandoff( { site, text }: { site: Site; text: string } ) {
	const translate = useTranslate();
	const { mutate, isPending } = useMutation( saveDraftMutation() );
	return (
		<>
			<p>
				{ translate( 'Publish on %(siteName)s', {
					args: { siteName: site.name },
				} ) }
			</p>
			<MoveToEditorButton site={ site } text={ text } mutate={ mutate } isPending={ isPending } />
		</>
	);
}

function SiteIconThumb( { site }: { site: Site } ) {
	const ico = site.icon?.img || site.icon?.ico;
	const src = useMemo( () => {
		if ( ! ico ) {
			return undefined;
		}
		try {
			const url = new URL( ico );
			url.searchParams.set( 'w', '64' );
			url.searchParams.set( 's', '64' );
			return url.toString();
		} catch {
			return ico;
		}
	}, [ ico ] );

	if ( src ) {
		return (
			<img
				className="social-composer__overflow-handoff-site-icon"
				src={ src }
				alt=""
				width={ 32 }
				height={ 32 }
				loading="lazy"
			/>
		);
	}

	const fallbackInitial = ( site.name || site.URL || '?' ).charAt( 0 );
	return (
		<div className="social-composer__overflow-handoff-site-letter" aria-hidden="true">
			<span>{ fallbackInitial }</span>
		</div>
	);
}

function getSiteDisplayUrl( site: Site ) {
	return ( site.URL || '' ).replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
}

function MultiSiteHandoffForm( { sites, text }: { sites: Site[]; text: string } ) {
	const translate = useTranslate();
	// Gate the picker render on `userSettings` having settled so the
	// pre-selected value doesn't flip from sites[0] to the primary site
	// once the query resolves (visible flicker if the user types past the
	// limit before the settings query is in cache).
	const { data: userSettings, isPending: settingsPending } = useQuery( userSettingsQuery() );

	const [ userSelection, setUserSelection ] = useState< number | null >( null );

	const { mutate, isPending } = useMutation( saveDraftMutation() );

	const options = useMemo(
		() =>
			sites.map( ( s ) => ( {
				value: String( s.ID ),
				label: s.name || s.URL,
				site: s,
			} ) ),
		[ sites ]
	);

	// Caller gates on a non-empty sites array, but TypeScript can't see
	// through that. Hooks above run unconditionally; this guard sits
	// below them and above the first `sites[0]` access.
	if ( sites.length === 0 ) {
		return null;
	}

	const initialSiteId =
		userSettings?.primary_site_ID && sites.some( ( s ) => s.ID === userSettings.primary_site_ID )
			? userSettings.primary_site_ID
			: sites[ 0 ].ID;

	const displayedSiteId = userSelection ?? initialSiteId;

	const selectedSite = sites.find( ( s ) => s.ID === displayedSiteId ) ?? sites[ 0 ];

	const renderItem = ( { item }: { item: { value: string; label: string; site?: Site } } ) => {
		const site = item.site ?? sites.find( ( s ) => String( s.ID ) === item.value );
		if ( ! site ) {
			return null;
		}
		const isSelected = item.value === String( displayedSiteId );
		return (
			<HStack
				className="social-composer__overflow-handoff-option"
				spacing={ 3 }
				alignment="left"
				justify="space-between"
			>
				<HStack spacing={ 3 } alignment="left" justify="left">
					<SiteIconThumb site={ site } />
					<VStack spacing={ 0 }>
						<Text as="div" weight={ 500 } size={ 14 } lineHeight={ 1.5 } color="inherit">
							{ item.label }
						</Text>
						<Text as="div" size={ 12 } weight={ 300 } lineHeight={ 1.2 } color="inherit">
							{ getSiteDisplayUrl( site ) }
						</Text>
					</VStack>
				</HStack>
				{ isSelected && (
					<Icon icon={ check } size={ 24 } className="social-composer__overflow-handoff-check" />
				) }
			</HStack>
		);
	};

	if ( settingsPending ) {
		return null;
	}

	return (
		<>
			<fieldset disabled={ isPending }>
				<ComboboxControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					className="social-composer__overflow-handoff-combobox"
					label={ translate( 'Choose a site' ) as string }
					value={ String( displayedSiteId ) }
					onChange={ ( newValue ) => {
						if ( newValue ) {
							setUserSelection( parseInt( newValue, 10 ) );
						}
					} }
					options={ options }
					allowReset={ false }
					__experimentalRenderItem={ renderItem }
				/>
			</fieldset>
			<MoveToEditorButton
				site={ selectedSite }
				text={ text }
				mutate={ mutate }
				isPending={ isPending }
			/>
		</>
	);
}

function MoveToEditorButton( {
	site,
	text,
	mutate,
	isPending,
}: {
	site: Site;
	text: string;
	mutate: SaveDraftMutate;
	isPending: boolean;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const { mode } = useComposer();
	const config = useComposerConfig();

	const handleClick = () => {
		// Fire on click intent (mirrors Quick Post's
		// `calypso_reader_quick_post_full_editor_opened`) so the event
		// captures the user's choice even when the draft save fails.
		if ( mode && config.overflowHandoff ) {
			const { event, props } = config.overflowHandoff.editorOpened( mode, { siteId: site.ID } );
			dispatch( recordReaderTracksEvent( event, props ) );
		}
		mutate(
			{ siteId: site.ID, content: text },
			{
				onSuccess: ( data ) => {
					// Fall back to a derived `/wp-admin/` path so a missing
					// `admin_url` doesn't orphan the just-saved draft.
					const adminUrl =
						site.options?.admin_url ?? `${ site.URL.replace( /\/$/, '' ) }/wp-admin/`;
					const editorUrl = addQueryArgs( `${ adminUrl }post.php`, {
						post: data.ID,
						action: 'edit',
					} );
					// `window.open` from a post-mutation callback can be
					// suppressed by popup blockers (transient user activation
					// expires while the request is in flight). When that
					// happens, surface the editor link in a success notice so
					// the user can complete the handoff via a fresh click.
					const newWindow = window.open( editorUrl, '_blank', 'noopener,noreferrer' );
					if ( ! newWindow ) {
						dispatch(
							successNotice( translate( 'Draft saved.' ), {
								button: translate( 'Open in editor' ),
								onClick: () => {
									window.open( editorUrl, '_blank', 'noopener,noreferrer' );
								},
							} )
						);
					}
				},
				onError: ( error ) => {
					dispatch(
						errorNotice(
							translate( "Couldn't save your draft. Try again or pick a different site." )
						)
					);
					logToLogstash( {
						feature: 'calypso_client',
						message: 'Reader social composer overflow handoff: save draft failed',
						severity: 'error',
						extra: {
							type: 'reader_social_composer_overflow_handoff_save_draft_error',
							site_id: site.ID,
							error_message: error.message,
						},
					} );
				},
			}
		);
	};

	return (
		<Button
			variant="primary"
			__next40pxDefaultSize
			onClick={ handleClick }
			isBusy={ isPending }
			disabled={ isPending }
		>
			{ translate( 'Move to editor' ) }
		</Button>
	);
}

// Sibling component rather than a parent-component effect: mounting is the
// gate, so we get one fire per modal session without re-implementing the
// `hasBeenOverLimit` + non-empty-sites preconditions in a dependency array.
function OverflowHandoffShownEffect( { mode }: { mode: ActiveMode | null } ) {
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const config = useComposerConfig();
	useEffect( () => {
		if ( ! mode || ! config.overflowHandoff ) {
			return;
		}
		const { event, props } = config.overflowHandoff.shown( mode );
		dispatch( recordReaderTracksEvent( event, props ) );
		// Fire once on mount; subsequent re-renders aren't a new "shown".
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	return null;
}

export function ComposerOverflowHandoff( { text }: ComposerOverflowHandoffProps ) {
	const translate = useTranslate();
	const { hasBeenOverLimit, mode } = useComposer();
	const config = useComposerConfig();

	const { data: sites } = useQuery( {
		...sitesQuery( 'all' ),
		enabled: hasBeenOverLimit,
	} );

	if ( ! hasBeenOverLimit ) {
		return null;
	}

	if ( ! sites || sites.length === 0 ) {
		return null;
	}

	return (
		<section
			className="social-composer__overflow-handoff"
			aria-label={ translate( 'Publish on your own site' ) as string }
		>
			<OverflowHandoffShownEffect mode={ mode } />
			<p>
				{ translate( 'Too long for %(protocol)s? Publish it on your own site instead.', {
					args: { protocol: config.protocolLabel },
					comment:
						'%(protocol)s is a brand name (e.g. "Bluesky", "Mastodon") and should not be translated.',
				} ) }
			</p>
			{ sites.length === 1 ? (
				<SingleSiteHandoff site={ sites[ 0 ] } text={ text } />
			) : (
				<MultiSiteHandoffForm sites={ sites } text={ text } />
			) }
		</section>
	);
}
