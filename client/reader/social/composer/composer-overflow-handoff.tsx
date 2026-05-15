import './composer-overflow-handoff.scss';

import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { SiteHandoff, useHandoffMutation } from 'calypso/reader/social/site-handoff';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { useComposerConfig } from './composer-config';
import { useComposer } from './composer-provider';
import type { ActiveMode } from './composer-provider';
import type { Site } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

// No-op default for `usePreferredHandoffSiteId` — keeps the hook count
// stable across renders when the per-protocol config doesn't supply one.
function useNullPreferredHandoffSiteId(): number | null {
	return null;
}

interface ComposerOverflowHandoffProps {
	text: string;
}

function OverflowHandoffShownEffect( { mode }: { mode: ActiveMode | null } ) {
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const config = useComposerConfig();
	useEffect( () => {
		if ( ! mode || ! config.overflowHandoff ) {
			return;
		}
		const { event, props } = config.overflowHandoff.shown( mode );
		dispatch( recordReaderTracksEvent( event, props ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );
	return null;
}

/**
 * Single-button handoff for protocols whose composer is already scoped
 * to a specific blog (Fediverse). Renders just the "Move to editor"
 * button — no site label, no chooser — because the user already knows
 * which blog they're publishing from. Reuses `useHandoffMutation` so the
 * draft-save + tab-handoff behavior is identical to `<SiteHandoff>`.
 */
function PreferredSiteHandoff( {
	site,
	content,
	buttonLabel,
	tracks,
}: {
	site: Site;
	content: string;
	buttonLabel: string;
	tracks?: {
		editorOpened?: ( siteId: number ) => { event: string; props: Record< string, unknown > };
	};
} ) {
	const { submit, isPending } = useHandoffMutation( {
		tracks,
		caller: 'overflow_handoff_preferred_site',
	} );
	return (
		<Button
			variant="primary"
			__next40pxDefaultSize
			onClick={ () => submit( { site, content } ) }
			isBusy={ isPending }
			disabled={ isPending }
		>
			{ buttonLabel }
		</Button>
	);
}

export function ComposerOverflowHandoff( { text }: ComposerOverflowHandoffProps ) {
	const translate = useTranslate();
	const { hasBeenOverLimit, hasRequestedMediaHandoff, mode } = useComposer();
	const config = useComposerConfig();

	const isVisible = hasBeenOverLimit || hasRequestedMediaHandoff;

	const { data: sites } = useQuery( {
		...sitesQuery( 'all' ),
		enabled: isVisible,
	} );

	// Read the per-protocol preferred-site hook unconditionally (Rules of
	// Hooks). When non-null, the handoff renders the memo + a single
	// "Move to editor" button without a site label or chooser — the
	// composer is already scoped to that blog (Fediverse pins to the
	// connection's blog), so showing "Publish on %(siteName)s" would
	// duplicate context the user already has.
	const usePreferredHandoffSiteId =
		config.usePreferredHandoffSiteId ?? useNullPreferredHandoffSiteId;
	const preferredSiteId = usePreferredHandoffSiteId( mode );

	if ( ! isVisible ) {
		return null;
	}

	if ( ! sites || sites.length === 0 ) {
		return null;
	}

	const preferredSite =
		preferredSiteId !== null && preferredSiteId !== undefined
			? sites.find( ( site ) => site.ID === preferredSiteId ) ?? null
			: null;

	const tracks = config.overflowHandoff
		? {
				editorOpened: ( siteId: number ) =>
					config.overflowHandoff!.editorOpened( mode!, { siteId } ),
		  }
		: undefined;

	return (
		<section
			className="social-composer__overflow-handoff"
			aria-label={ translate( 'Publish on your own site' ) as string }
		>
			<OverflowHandoffShownEffect mode={ mode } />
			<p>
				{ hasRequestedMediaHandoff
					? translate(
							'Want to add media? Adding images isn’t supported here yet — publish it on your own site instead.'
					  )
					: translate( 'Too long for %(protocol)s? Publish it on your own site instead.', {
							args: { protocol: config.protocolLabel },
							comment:
								'%(protocol)s is a brand name (e.g. "Bluesky", "Mastodon") and should not be translated.',
					  } ) }
			</p>
			{ preferredSite ? (
				<PreferredSiteHandoff
					site={ preferredSite }
					content={ text }
					buttonLabel={ translate( 'Move to editor' ) as string }
					tracks={ tracks }
				/>
			) : (
				<SiteHandoff
					sites={ sites }
					content={ text }
					buttonLabel={ translate( 'Move to editor' ) as string }
					tracks={ tracks }
					caller="overflow_handoff"
				/>
			) }
		</section>
	);
}
