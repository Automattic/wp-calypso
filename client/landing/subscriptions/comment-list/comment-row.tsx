import { Gridicon } from '@automattic/components';
import moment from 'moment';
import { useMemo } from 'react';
import type { PostSubscription } from '@automattic/data-stores/src/reader/types';

const CommentRow = ( {
	title,
	excerpt,
	site_title,
	site_icon,
	site_url,
	date_subscribed,
}: PostSubscription ) => {
	const since = useMemo(
		() => moment( date_subscribed ).format( 'LL' ),
		[ date_subscribed, moment ]
	);
	const hostname = useMemo( () => new URL( site_url ).hostname, [ site_url ] );
	const siteIcon = useMemo( () => {
		if ( site_icon ) {
			return <img className="icon" src={ site_icon } alt={ site_title } />;
		}
		return <Gridicon className="icon" icon="globe" size={ 48 } />;
	}, [ site_icon, site_title ] );

	return (
		<li className="row" role="row">
			<span className="post" role="cell">
				<span className="title">{ title }</span>
				<span className="excerpt">{ excerpt }</span>
			</span>
			<span className="title-box" role="cell">
				{ siteIcon }
				<span className="title-column">
					<span className="name">{ site_title }</span>
					<span className="url">{ hostname }</span>
				</span>
			</span>
			<span className="date" role="cell">
				{ since }
			</span>
			<span className="actions" role="cell">
				actions
			</span>
		</li>
	);
};

export default CommentRow;
