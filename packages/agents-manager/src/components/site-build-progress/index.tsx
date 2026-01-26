/**
 * External dependencies
 */
import { UIMessage } from '@automattic/agenttic-client';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
//import './style.scss';

/**
 * Extracts text content from a message object
 */
const getMessageText = ( message: UIMessage ) => {
	if ( ! message?.content ) {
		return '';
	}

	// Handle array content
	const content = Array.isArray( message.content ) ? message.content : [ message.content ];

	// Look for text block
	const textBlock = content.find( ( block ) => block.type === 'text' && block.text );
	if ( textBlock?.text ) {
		return textBlock.text;
	}

	// Fallback: try to get text from first block
	if ( content[ 0 ]?.text ) {
		return content[ 0 ].text;
	}

	return '';
};

/**
 * Returns the CSS class for the indicator based on item state
 */
const getIndicatorClass = ( item: { completed: boolean } ) => {
	if ( item.completed ) {
		return 'site-build-progress__indicator--completed';
	}
	return 'site-build-progress__indicator--loading';
};

/**
 * Checkmark icon for completed items
 */
const CheckmarkIcon = (
	<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M10 3L4.5 8.5L2 6"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/**
 * SiteBuildProgress component displays site build progress messages
 * in a grouped card format with checkmarks and connecting lines.
 */
export default function SiteBuildProgress( {
	messages,
	thinkingMessage,
}: {
	messages: UIMessage[];
	thinkingMessage: string;
} ) {
	const hasMessages = messages && messages.length > 0;
	const hasThinkingMessage = Boolean( thinkingMessage );

	if ( ! hasMessages && ! hasThinkingMessage ) {
		return null;
	}

	const completedItems = hasMessages
		? messages.map( ( message ) => ( {
				id: message.id,
				text: getMessageText( message ),
				completed: true,
		  } ) )
		: [];

	// Add in-progress item if building
	const allItems = hasThinkingMessage
		? [
				...completedItems,
				{
					id: 'thinking',
					text: thinkingMessage,
					completed: false,
				},
		  ]
		: completedItems;

	return (
		<div className="site-build-progress">
			<div className="site-build-progress__header">
				<span className="site-build-progress__title">
					{ __( 'Generating your site', 'big-sky' ) }
				</span>
			</div>
			<ul className="site-build-progress__list">
				{ allItems.map( ( item, index ) => (
					<li
						key={ item.id }
						className={ `site-build-progress__item ${
							! item.completed ? 'site-build-progress__item--in-progress' : ''
						}` }
						data-last={ index === allItems.length - 1 }
					>
						<div className={ `site-build-progress__indicator ${ getIndicatorClass( item ) }` }>
							{ item.completed ? CheckmarkIcon : <div className="site-build-progress__spinner" /> }
						</div>
						<span className="site-build-progress__text">{ item.text }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
}
