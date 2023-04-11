import { __ } from '@wordpress/i18n';
import FacebookPostIcon from '../icons';

import './styles.scss';

const FacebookPostActions: React.FC = () => {
	return (
		<ul className="facebook-preview__post-actions">
			<li>
				<FacebookPostIcon name="like" />
				<span>
					{
						// translators: Facebook "Like" action
						__( 'Like' )
					}
				</span>
			</li>
			<li>
				<FacebookPostIcon name="comment" />
				<span>
					{
						// translators: Facebook "Comment" action
						__( 'Comment' )
					}
				</span>
			</li>
			<li>
				<FacebookPostIcon name="share" />
				<span>
					{
						// translators: Facebook "Share" action
						__( 'Share' )
					}
				</span>
			</li>
		</ul>
	);
};

export default FacebookPostActions;
