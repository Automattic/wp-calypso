import { __ } from '@wordpress/i18n';
import MastodonPostIcon from '../icons';

import './styles.scss';

const MastodonPostActions: React.FC = () => (
	<div className="mastodon-preview__post-actions">
		<ul>
			{ [
				{
					icon: 'reply',
					// translators: "Reply" action on a Mastodon post
					label: __( 'Reply', 'social-previews' ),
					text: 0,
				},
				{
					icon: 'boost',
					// translators: "Boost" action on a Mastodon post
					label: __( 'Boost', 'social-previews' ),
				},
				{
					icon: 'like',
					// translators: "Favourite" action on a Mastodon post
					label: __( 'Favourite', 'social-previews' ),
				},
				{
					icon: 'bookmark',
					// translators: "Bookmark" action on a Mastodon post
					label: __( 'Bookmark', 'social-previews' ),
				},
				{
					icon: 'more',
					// translators: "More" menu on a Mastodon post
					label: __( 'More', 'social-previews' ),
				},
			].map( ( { icon, label, text } ) => (
				<li key={ icon } aria-label={ label }>
					<span className="mastodon-preview__post-icon-wrapper">
						<MastodonPostIcon name={ icon } />
					</span>
					{ ( typeof text === 'number' || text ) && (
						<span className="mastodon-preview__post-icon-text">{ text }</span>
					) }
				</li>
			) ) }
		</ul>
	</div>
);

export default MastodonPostActions;
