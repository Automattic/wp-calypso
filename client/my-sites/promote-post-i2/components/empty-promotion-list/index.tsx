import './style.scss';
import { __ } from '@wordpress/i18n';

type Props = {
	type: 'campaigns' | 'posts';
};

export const PromoteTypes = {
	campaigns: 'campaigns',
	posts: 'posts',
};

type PromoteStrings = {
	[ key in keyof typeof PromoteTypes ]: {
		title: string;
		body: string;
		linkTitle?: string;
		linkUrl?: string;
	};
};

const strings: PromoteStrings = {
	campaigns: {
		title: __( 'There are no campaigns yet.' ),
		body: __(
			'Start promoting a post or page from the list of content ready to promote or find your post or a page, then from the ellipsis, select promote.'
		),
		linkTitle: __( 'Learn how to start a campaign' ),
		linkUrl: '',
	},
	posts: {
		title: __( 'You have no posts or pages.' ),
		body: __( "Start by creating a post or a page and start promoting it once it's ready." ),
	},
};

export default function EmptyPromotionList( props: Props ) {
	const { type } = props;
	return (
		<div className="empty-promotion-list__container">
			<h3 className="empty-promotion-list__title">{ strings[ type ].title }</h3>
			<p className="empty-promotion-list__body">{ strings[ type ].body }</p>

			{ strings[ type ].linkUrl && (
				<p className="empty-promotion-list__link">
					<a href={ strings[ type ].linkUrl }>{ strings[ type ].linkTitle }</a>
				</p>
			) }
		</div>
	);
}
