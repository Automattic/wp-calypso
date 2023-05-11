import { __ } from '@wordpress/i18n';
import TumblrPostIcon from '../icons';

import './styles.scss';

const TumblrPostActions: React.FC = () => (
	<div className="tumblr-preview__post-actions">
		<div className="tumblr-preview__post-manage-actions">
			<div className="tumblr-preview__post-actions-blaze">
				<TumblrPostIcon name="blaze" />
				&nbsp;Blaze
			</div>
			<ul>
				{ [
					{
						icon: 'delete',
						// translators: "Delete" action on a Tumblr post
						label: __( 'Delete', 'social-previews' ),
					},
					{
						icon: 'edit',
						// translators: "Edit" action on a Tumblr post
						label: __( 'Edit', 'social-previews' ),
					},
				].map( ( { icon, label } ) => (
					<li key={ icon } aria-label={ label }>
						<TumblrPostIcon name={ icon } />
					</li>
				) ) }
			</ul>
		</div>
		<div className="tumblr-preview__post-social-actions">
			<div>
				{
					// translators: count of notes on a Tumblr post
					__( '0 notes', 'social-previews' )
				}
			</div>
			<ul>
				{ [
					{
						icon: 'share',
						// translators: "Share" action on a Tumblr post
						label: __( 'Share', 'social-previews' ),
					},
					{
						icon: 'reply',
						// translators: "Reply" action on a Tumblr post
						label: __( 'Reply', 'social-previews' ),
					},
					{
						icon: 'reblog',
						// translators: "Reblog" action on a Tumblr post
						label: __( 'Reblog', 'social-previews' ),
					},
					{
						icon: 'like',
						// translators: "Like" action on a Tumblr post
						label: __( 'Like', 'social-previews' ),
					},
				].map( ( { icon, label } ) => (
					<li key={ icon } aria-label={ label }>
						<TumblrPostIcon name={ icon } />
					</li>
				) ) }
			</ul>
		</div>
	</div>
);

export default TumblrPostActions;
