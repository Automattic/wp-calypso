import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isThisASupportArticleLink } from '@automattic/urls';
import { useMemo } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { uriTransformer } from '../../utils/uri-transformer';

export default function CustomALink( {
	href,
	children,
	target = '_self',
	...props
}: React.AnchorHTMLAttributes< HTMLAnchorElement > ) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const transformedHref = useMemo( () => uriTransformer( href ?? '' ), [ href ] );

	return (
		<a
			{ ...props }
			href={ transformedHref }
			target={ target }
			rel="noopener noreferrer"
			onClick={ ( e ) => {
				const isSupportArticle = isThisASupportArticleLink( transformedHref );

				// Open support article links in the post view.
				if ( isSupportArticle ) {
					e.preventDefault();
					navigate( `/post?link=${ transformedHref }` );
				}

				recordTracksEvent( 'calypso_agents_manager_link_click', {
					href: transformedHref,
					type: isSupportArticle ? 'support_article' : 'external',
					source: pathname === '/chat' ? 'orchestrator' : 'zendesk',
				} );
			} }
		>
			{ children }
		</a>
	);
}
