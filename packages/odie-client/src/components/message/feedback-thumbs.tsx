import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';

export const FeedbackThumbs = () => {
	const { __ } = useI18n();
	const text = __( 'Was this helpful?' );
	return (
		<div className="odie-conversation__feedback">
			<div className="odie-conversation-feedback__text">
				<p>{ text }</p>
			</div>
			<div className="odie-conversation-feedback__thumbs">
				<Button rel="noreferrer" target="_blank">
					<ThumbsUpIcon />
				</Button>
				<Button rel="noreferrer" target="_blank">
					<ThumbsDownIcon />
				</Button>
			</div>
		</div>
	);
};
