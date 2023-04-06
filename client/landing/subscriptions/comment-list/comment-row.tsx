import type { PostSubscription } from '@automattic/data-stores/src/reader/types';

const CommentRow = ( {
	id,
	title,
	excerpt,
	site_icon,
	site_url,
	date_subscribed,
}: PostSubscription ) => {
	return (
		<li className="row" role="row">
			{ id } <br />
			{ title } <br />
			{ excerpt } <br />
			{ site_icon } <br />
			{ site_url } <br />
			{ date_subscribed } <br />
		</li>
	);
};

export default CommentRow;
