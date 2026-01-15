import { isThisASupportArticleLink } from '@automattic/urls';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdieAssistantContext } from '../../context';
import { uriTransformer } from './uri-transformer';

// This component will be extended in the future to support other types of links.
// For now, it only supports prompt:// links. But in the future might be more protocols like:
// - navigate:// to navigate within calypso
// - choice:// to send a message to the bot based on the user's choice
// - confirm:// to send a message to the bot based on the user's confirmation
// - etc.
const CustomALink = ( {
	href,
	children,
	inline = true,
	target = '_self',
}: {
	href?: string;
	children?: React.ReactNode;
	inline?: boolean;
	target?: string;
} ) => {
	const { trackEvent } = useOdieAssistantContext();
	const navigate = useNavigate();

	const transformedHref = useMemo( () => uriTransformer( href ?? '' ), [ href ] );

	const classNames = clsx( 'odie-sources', {
		'odie-sources-inline': inline,
	} );

	return (
		<span className={ classNames }>
			<a
				className="odie-sources-link"
				href={ transformedHref }
				target={ target }
				rel="noopener noreferrer"
				onClick={ ( e ) => {
					// Open support article links in the Help Center.
					if ( isThisASupportArticleLink( transformedHref ) ) {
						navigate( `/post?link=${ transformedHref }` );
						e.preventDefault();
					}
					trackEvent( 'chat_message_action_click', {
						action: 'link',
						in_chat_view: false,
						href: transformedHref,
					} );
				} }
			>
				{ children }
			</a>
		</span>
	);
};

export default CustomALink;
