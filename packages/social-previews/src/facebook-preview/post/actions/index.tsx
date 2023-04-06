import { useTranslate } from 'i18n-calypso';
import FacebookPostIcon from '../icons';

import './styles.scss';

const FacebookPostActions: React.FC = () => {
	const translate = useTranslate();

	return (
		<ul className="facebook-preview__post-actions">
			<li>
				<FacebookPostIcon name="like" />
				<span>{ translate( 'Like', { comment: 'Facebook "Like" action' } ) }</span>
			</li>
			<li>
				<FacebookPostIcon name="comment" />
				<span>{ translate( 'Comment', { comment: 'Facebook "Comment" action' } ) }</span>
			</li>
			<li>
				<FacebookPostIcon name="share" />
				<span>{ translate( 'Share', { comment: 'Facebook "Share" action' } ) }</span>
			</li>
		</ul>
	);
};

export default FacebookPostActions;
