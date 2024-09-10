import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useOdieAssistantContext } from '../../context';
import FoldableCard from '../foldable';
import SupportDocLink from '../support-link';
import CustomALink from './custom-a-link';
import type { Message, Source } from '../../types/';

export const Sources = ( { message }: { message: Message } ) => {
	const { trackEvent, navigateToSupportDocs } = useOdieAssistantContext();
	const { _x } = useI18n();
	const sources = useMemo( () => {
		const messageLength = message?.context?.sources?.length ?? 0;
		if ( messageLength > 0 ) {
			// Record TrainTracks render events
			message.context?.sources?.forEach( ( source: Source, index: number ) => {
				trackEvent( 'sources_traintracks_render', {
					fetch_algo: source?.railcar?.fetch_algo,
					ui_algo: 'default',
					railcar: source?.railcar?.railcar,
					fetch_position: source?.railcar?.fetch_position,
					ui_position: index,
				} );
			} );
			return [
				...new Map(
					message.context?.sources?.map( ( source: Source ) => [ source.url, source ] )
				).values(),
			];
		}
		return [];
	}, [ message?.context?.sources, trackEvent ] );

	const hasSources = message?.context?.sources && message.context?.sources.length > 0;
	if ( ! hasSources ) {
		return null;
	}

	return (
		<FoldableCard
			className="odie-sources-foldable-card"
			clickableHeader
			header={ _x(
				'Related Guides',
				'Below this text are links to sources for the current message received from the bot.',
				__i18n_text_domain__
			) }
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
		>
			<div className="odie-chatbox-message-sources">
				{ sources.length > 0 &&
					sources.map( ( source, index ) =>
						navigateToSupportDocs ? (
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
									navigateToSupportDocs(
										String( source.blog_id ),
										String( source.post_id ),
										source.title,
										source.url
									);
								} }
								title={ source.title }
							/>
						) : (
							<CustomALink key={ index } href={ source.url } inline={ false }>
								{ source.title }
							</CustomALink>
						)
					) }
			</div>
		</FoldableCard>
	);
};

export default Sources;
