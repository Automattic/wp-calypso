import { FoldableCard } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import SupportDocLink from '../support-link';
import type { Message, Source } from '../../types';

export const Sources = ( {
	message,
	isMessageShowingDisclaimer,
}: {
	message: Message;
	isMessageShowingDisclaimer: boolean;
} ) => {
	const navigate = useNavigate();
	const { trackEvent } = useOdieAssistantContext();
	const sources = useMemo( () => {
		const messageLength = message?.context?.sources?.length ?? 0;
		if ( messageLength > 0 ) {
			// Record TrainTracks render events
			message.context?.sources?.forEach( ( source: Source, index: number ) => {
				if ( source.railcar ) {
					trackEvent( 'sources_traintracks_render', {
						fetch_algo: source?.railcar?.fetch_algo,
						ui_algo: 'default',
						message_id: message?.message_id,
						railcar: source?.railcar?.railcar,
						fetch_position: source?.railcar?.fetch_position,
						fetch_query: source?.railcar?.fetch_query,
						fetch_lang: source?.railcar?.fetch_lang,
						ui_position: index,
						rec_blog_id: source?.railcar?.rec_blog_id,
						rec_post_id: source?.railcar?.rec_post_id,
					} );
				}
			} );
			return [
				...new Map(
					message.context?.sources?.map( ( source: Source ) => [ source.url, source ] )
				).values(),
			];
		}
		return [];
	}, [ message?.context?.sources, message?.message_id, trackEvent ] );

	const hasSources = message?.context?.sources && message.context?.sources.length > 0;
	if ( ! hasSources ) {
		return null;
	}

	const handleGuidelinesClick = () => {
		trackEvent?.( 'ai_guidelines_link_clicked' );
	};

	const renderDisclaimers = () => (
		<div className="disclaimer">
			{ createInterpolateElement(
				__( 'Some responses may be inaccurate. <a>Learn more</a>', __i18n_text_domain__ ),
				{
					a: (
						// @ts-expect-error Children must be passed to External link. This is done by createInterpolateElement, but the types don't see that.
						<ExternalLink
							href="https://automattic.com/ai-guidelines"
							onClick={ handleGuidelinesClick }
						/>
					),
				}
			) }
		</div>
	);

	return (
		<FoldableCard
			className="odie-sources-foldable-card"
			clickableHeader
			expandedSummary={ __( 'Sources', __i18n_text_domain__ ) }
			summary={ __( 'Sources', __i18n_text_domain__ ) }
			smooth
			onClose={ () =>
				trackEvent( 'chat_message_action_sources', {
					action: 'close',
					message_id: message.message_id,
				} )
			}
			onOpen={ () =>
				trackEvent( 'chat_message_action_sources', {
					action: 'open',
					message_id: message.message_id,
				} )
			}
			screenReaderText="More"
			iconSize={ 16 }
		>
			<div className="odie-chatbox-message-sources">
				{ sources.length > 0 &&
					sources.map( ( source, index ) => (
						<SupportDocLink
							key={ index }
							link={ source.url }
							onLinkClickHandler={ () => {
								trackEvent( 'chat_message_action_click', {
									action: 'link',
									in_chat_view: true,
									href: source.url,
								} );
								trackEvent( 'sources_traintracks_interact', {
									railcar: source?.railcar?.railcar,
									action: 'click',
									href: source.url,
								} );
								navigate( `/post?link=${ source.url }` );
							} }
							title={ source.title }
						/>
					) ) }
			</div>
			{ isMessageShowingDisclaimer && renderDisclaimers() }
		</FoldableCard>
	);
};

export default Sources;
