import classnames from 'classnames';
import { useOdieAssistantContext } from '../context';

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
	href: string;
	children: React.ReactNode;
	inline?: boolean;
} ) => {
	const { trackEvent } = useOdieAssistantContext();

	const classNames = classnames( 'odie-sources', {
		'odie-sources-inline': inline,
	} );

	return (
		<span className={ classNames }>
			<a
				className="odie-sources-link"
				href={ href }
				target="_blank"
				rel="noopener noreferrer"
				onClick={ () => {
					trackEvent( 'chat_message_action_click', {
						action: 'link',
						href: href,
					} );
				} }
			>
				{ children }
			</a>
		</span>
	);
};

export default CustomALink;
