import './composer-overflow-handoff.scss';

import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { SiteHandoff } from 'calypso/reader/social/site-handoff';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { useComposerConfig } from './composer-config';
import { useComposer } from './composer-provider';
import type { ActiveMode } from './composer-provider';
import type { AppState } from 'calypso/types';

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
				{ translate( 'Too long for %(protocol)s? Publish it on your own site instead.', {
					args: { protocol: config.protocolLabel },
					comment:
						'%(protocol)s is a brand name (e.g. "Bluesky", "Mastodon") and should not be translated.',
				} ) }
			</p>
			<SiteHandoff
				sites={ sites }
				content={ text }
				buttonLabel={ translate( 'Move to editor' ) as string }
				tracks={ tracks }
				caller="overflow_handoff"
			/>
		</section>
	);
}
