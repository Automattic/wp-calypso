import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../../context';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';

export const FeedbackThumbs = () => {
	const { chat } = useOdieAssistantContext();
	const { __ } = useI18n();

	const ratingConversation = async ( score: 'GOOD' | 'BAD' ) => {
		const comment =
			score === 'GOOD' ? 'User submitted positive feedback' : 'User submitted negative feedback';
		try {
			const payload = {
				csat_rating: score,
				comment,
			};

			await Smooch.sendMessage(
				{
					type: 'text',
					text: score,
					payload: JSON.stringify( payload ),
				},
				chat.conversationId
			);
		} catch ( error ) {
			// console.error( 'Error sending rating:', error );
		}
	};

	const text = __( 'Was this helpful?' );

	return (
		<div className="odie-conversation__feedback">
			<div className="odie-conversation-feedback__text">
				<p>{ text }</p>
			</div>
			<div className="odie-conversation-feedback__thumbs">
				<Button onClick={ () => ratingConversation( 'GOOD' ) } rel="noreferrer">
					<ThumbsUpIcon />
				</Button>
				<Button onClick={ () => ratingConversation( 'BAD' ) } rel="noreferrer">
					<ThumbsDownIcon />
				</Button>
			</div>
		</div>
	);
};
