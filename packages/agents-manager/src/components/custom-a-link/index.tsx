import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isThisASupportArticleLink } from '@automattic/urls';
import { useMemo } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { uriTransformer } from '../../utils/uri-transformer';

export default function CustomALink( {
	href,
	children,
	...props
}: React.AnchorHTMLAttributes< HTMLAnchorElement > ) {
	const navigate = useNavigate();
	const { pathname, state } = useLocation();
	const { getActiveSessionId } = useAgentsManagerContext();
	const transformedHref = useMemo( () => uriTransformer( href ?? '' ), [ href ] );

	// Unsafe URL: render as plain text.
	if ( ! transformedHref ) {
		return <>{ children }</>;
	}

	return (
		<a
			{ ...props }
			href={ transformedHref }
			rel="noopener noreferrer"
			onClick={ ( e ) => {
				const isSupportArticle = isThisASupportArticleLink( transformedHref );
				const isFromOrchestrator = pathname === '/chat';

				// Open support article links in the post view.
				if ( isSupportArticle ) {
					e.preventDefault();
					// Forward route `state` (`sessionId`/`conversationId`) to preserve chat context.
					navigate( `/post?link=${ encodeURIComponent( transformedHref ) }`, {
						state: isFromOrchestrator ? { ...state, sessionId: getActiveSessionId() } : state,
					} );
				}

				recordTracksEvent( 'calypso_agents_manager_link_click', {
					href: transformedHref,
					type: isSupportArticle ? 'support_article' : 'external',
					source: isFromOrchestrator ? 'orchestrator' : 'zendesk',
				} );
			} }
		>
			{ children }
		</a>
	);
}
