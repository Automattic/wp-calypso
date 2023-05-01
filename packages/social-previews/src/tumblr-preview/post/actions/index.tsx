import { __ } from '@wordpress/i18n';
import { TumblrPreviewProps } from '../../types';
import TumblrPostIcon from '../icons';

import './styles.scss';

type Props = Pick< TumblrPreviewProps, 'readOnly' >;

const TumblrPostActions: React.FC< Props > = ( { readOnly } ) => (
	<div className="tumblr-preview__post-actions">
		{ ! readOnly && (
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
							label: __( 'Delete', 'tumblr-preview' ),
						},
						{
							icon: 'edit',
							// translators: "Edit" action on a Tumblr post
							label: __( 'Edit', 'tumblr-preview' ),
						},
					].map( ( { icon, label } ) => (
						<li key={ icon } aria-label={ label }>
							<TumblrPostIcon name={ icon } />
						</li>
					) ) }
				</ul>
			</div>
		) }
		<div className="tumblr-preview__post-social-actions">
			<div>
				{
					// translators: count of notes on a Tumblr post
					__( '0 notes', 'tumblr-preview' )
				}
			</div>
			<ul>
				{ [
					{
						icon: 'share',
						// translators: "Share" action on a Tumblr post
						label: __( 'Share', 'tumblr-preview' ),
					},
					readOnly
						? null
						: {
								icon: 'reply',
								// translators: "Reply" action on a Tumblr post
								label: __( 'Reply', 'tumblr-preview' ),
						  },
					{
						icon: 'reblog',
						// translators: "Reblog" action on a Tumblr post
						label: __( 'Reblog', 'tumblr-preview' ),
					},
					{
						icon: 'like',
						// translators: "Like" action on a Tumblr post
						label: __( 'Like', 'tumblr-preview' ),
					},
				]
					.filter( Boolean )
					.map( ( item ) => {
						const { icon, label } = item as { icon: string; label: string };

						return (
							<li key={ icon } aria-label={ label }>
								<TumblrPostIcon name={ icon } />
							</li>
						);
					} ) }
			</ul>
		</div>
	</div>
);

export default TumblrPostActions;
