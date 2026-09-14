import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ComposerExtrasPill } from 'calypso/reader/social/composer';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { AtmosphereInteractionSettings } from './atmosphere-interaction-settings';
import { pillSummary } from './pill-summary';
import { serializeInteractionSettings, summarizeForTracks } from './serialize';
import { DEFAULT_ALLOW_QUOTES, DEFAULT_REPLY_ALLOW, type ReplyAllow } from './state';
import type { CreatePostParams } from '@automattic/api-core';
import type { ActiveMode, ComposerProtocolExtrasSlot } from 'calypso/reader/social/composer';
import type { AppState } from 'calypso/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

function labelForKey(
	key: ReturnType< typeof pillSummary >[ 'labelKey' ],
	translate: ReturnType< typeof useTranslate >
): string {
	switch ( key ) {
		case 'anyone':
			return String( translate( 'Anyone can reply' ) );
		case 'nobody':
			return String( translate( 'Nobody can reply' ) );
		case 'follower':
			return String( translate( 'Your followers' ) );
		case 'following':
			return String( translate( 'People you follow' ) );
		case 'mention':
			return String( translate( 'People you mention' ) );
		case 'some':
			return String( translate( 'Some people can reply' ) );
		default:
			key satisfies never;
			return String( translate( 'Anyone can reply' ) );
	}
}

/**
 * Atmosphere implementation of `ComposerProtocolExtrasSlot`. Owns reply-gate
 * + allow-quotes state at provider lifetime, renders a footer pill that opens
 * the `<AtmosphereInteractionSettings>` popover, and merges
 * `interaction_settings` into the wire params on submit (only when non-default
 * — anyone-replies + allow-quotes serializes to nothing).
 *
 * Gates only apply on standalone posts: replies/quotes inherit from the
 * thread root in the AT-Proto threadgate / postgate model, so the trigger
 * renders `null` and `extendBuildParams` is a no-op for non-standalone modes.
 */
export function useAtmosphereInteractionSettings( ctx: {
	mode: ActiveMode | null;
	connectionId: number;
} ): ComposerProtocolExtrasSlot {
	const translate = useTranslate();
	const dispatch = useDispatch< ThunkDispatch< AppState, void, UnknownAction > >();
	const [ replyAllow, setReplyAllow ] = useState< ReplyAllow >( DEFAULT_REPLY_ALLOW );
	const [ allowQuotes, setAllowQuotes ] = useState< boolean >( DEFAULT_ALLOW_QUOTES );

	const clear = useCallback( () => {
		setReplyAllow( DEFAULT_REPLY_ALLOW );
		setAllowQuotes( DEFAULT_ALLOW_QUOTES );
	}, [] );

	const renderTrigger = useCallback( () => {
		if ( ctx.mode?.kind !== 'standalone' ) {
			return null;
		}
		const summary = pillSummary( replyAllow );
		return (
			<ComposerExtrasPill
				icon={ summary.icon }
				label={ labelForKey( summary.labelKey, translate ) }
				ariaLabel={ String( translate( 'Post interaction settings' ) ) }
				onOpen={ () => {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_atmosphere_interaction_settings_opened', {
							connection_id: ctx.connectionId,
							mode_kind: 'standalone',
						} )
					);
				} }
				popoverContent={ ( { onClose, headingId } ) => (
					<AtmosphereInteractionSettings
						headingId={ headingId }
						initialReplyAllow={ replyAllow }
						initialAllowQuotes={ allowQuotes }
						onSave={ ( nextReplyAllow, nextAllowQuotes ) => {
							setReplyAllow( nextReplyAllow );
							setAllowQuotes( nextAllowQuotes );
							const summarized = summarizeForTracks( nextReplyAllow, nextAllowQuotes );
							if ( Object.keys( summarized ).length > 0 ) {
								dispatch(
									recordReaderTracksEvent(
										'calypso_reader_atmosphere_interaction_settings_changed',
										{ connection_id: ctx.connectionId, ...summarized }
									)
								);
							}
							onClose();
						} }
					/>
				) }
			/>
		);
	}, [ ctx.mode, ctx.connectionId, replyAllow, allowQuotes, translate, dispatch ] );

	const extendBuildParams = useCallback(
		( params: unknown ): unknown => {
			const base = params as CreatePostParams;
			if ( ctx.mode?.kind !== 'standalone' ) {
				return base;
			}
			const wire = serializeInteractionSettings( replyAllow, allowQuotes );
			return wire ? { ...base, interaction_settings: wire } : base;
		},
		[ ctx.mode, replyAllow, allowQuotes ]
	);

	const getTracksProps = useCallback( (): Record< string, unknown > => {
		if ( ctx.mode?.kind !== 'standalone' ) {
			return {};
		}
		return summarizeForTracks( replyAllow, allowQuotes );
	}, [ ctx.mode, replyAllow, allowQuotes ] );

	return {
		renderControls: () => null,
		renderTrigger,
		extendBuildParams,
		clear,
		getTracksProps,
	};
}
