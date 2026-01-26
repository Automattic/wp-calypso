import { UIMessage } from '@automattic/agenttic-client';
import SiteBuildProgress from './index';

type Message = UIMessage & { context?: string };

/**
 * Checks if any message has the site-build-completed context
 */
export function hasSiteBuildMessages( messages: Message[] ) {
	return messages.some( ( msg ) => msg.context === 'site-build-completed' );
}

/**
 * Groups consecutive site-build-completed messages into a single message
 * with a SiteBuildProgress component.
 *
 * Only call this when hasSiteBuildMessages() returns true or when
 * thinkingMessage is set during a site build.
 */
export function groupSiteBuildMessages( messages: Message[], thinkingMessage: string | null ) {
	const result = [];
	let siteBuildGroup: UIMessage[] = [];

	const flushSiteBuildGroup = ( isLastGroup = false ) => {
		if ( siteBuildGroup.length > 0 || ( isLastGroup && thinkingMessage ) ) {
			// Create a single grouped message
			result.push( {
				id:
					siteBuildGroup.length > 0
						? `site-build-group-${ siteBuildGroup[ 0 ].id }`
						: 'site-build-group-thinking',
				role: 'assistant',
				content: [
					{
						type: 'component',
						component: SiteBuildProgress,
						componentProps: {
							messages: siteBuildGroup,
							thinkingMessage: isLastGroup ? thinkingMessage : null,
						},
					},
				],
				timestamp: siteBuildGroup.length > 0 ? siteBuildGroup[ 0 ].timestamp : Date.now(),
				archived: false,
				showIcon: false,
			} );
			siteBuildGroup = [];
		}
	};

	for ( const msg of messages ) {
		// Check if message has a component (like InlineSuggestions) - these should be shown as regular messages
		const hasComponent =
			Array.isArray( msg.content ) && msg.content.some( ( block ) => block.type === 'component' );

		if ( msg.context === 'site-build-completed' && ! hasComponent ) {
			siteBuildGroup.push( msg );
		} else {
			flushSiteBuildGroup( false );
			result.push( msg );
		}
	}

	// Flush any remaining site-build messages (this is the last group)
	flushSiteBuildGroup( true );

	return result;
}
