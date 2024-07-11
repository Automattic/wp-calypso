import clsx from 'clsx';
import { useOdieAssistantContext } from '../../context';
import { uriTransformer } from './uri-transformer';

import './style.scss';

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
}: {
	href?: string;
	children?: React.ReactNode;
	inline?: boolean;
} ) => {
	const { trackEvent } = useOdieAssistantContext();

	const classNames = clsx( 'odie-sources', {
		'odie-sources-inline': inline,
	} );

	const transformedHref = uriTransformer( href ?? '' );

	return (
		<span className={ classNames }>
			<a
				className="odie-sources-link"
				href={ transformedHref }
				target={ inline ? '_blank' : '_self' }
				rel="noopener noreferrer"
				onClick={ () => {
					trackEvent( 'chat_message_action_click', {
						action: 'link',
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
