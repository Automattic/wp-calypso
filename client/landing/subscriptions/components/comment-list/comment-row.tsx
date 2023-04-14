import { Gridicon } from '@automattic/components';
import { memo, useMemo } from 'react';
import TimeSince from 'calypso/components/time-since';
import { CommentSettings } from '../settings-popover';
import type { CommentSubscription } from '@automattic/data-stores/src/reader/types';

type CommentRowProps = CommentSubscription & {
	forwardedRef: React.Ref< HTMLDivElement >;
	style: React.CSSProperties;
};

const CommentRow = ( {
	post_title,
	post_excerpt,
	post_url,
	site_title,
	site_icon,
	site_url,
	subscription_date,
	forwardedRef,
	style,
}: CommentRowProps ) => {
	const hostname = useMemo( () => new URL( site_url ).hostname, [ site_url ] );
	const siteIcon = useMemo( () => {
		if ( site_icon ) {
			return <img className="icon" src={ site_icon } alt={ site_title } />;
		}
		return <Gridicon className="icon" icon="globe" size={ 48 } />;
	}, [ site_icon, site_title ] );
	return (
		<div style={ style } ref={ forwardedRef } className="row-wrapper">
			<div className="row" role="row">
				<span className="post" role="cell">
					<div className="title">
						<a href={ post_url } target="_blank" rel="noreferrer noopener">
							{ post_title }
						</a>
					</div>
					<div className="excerpt">{ post_excerpt }</div>
				</span>
				<a href={ site_url } rel="noreferrer noopener" className="title-box" target="_blank">
					<span className="title-box" role="cell">
						{ siteIcon }
						<span className="title-column">
							<span className="name">{ site_title }</span>
							<span className="url">{ hostname }</span>
						</span>
					</span>
				</a>
				<span className="date" role="cell">
					<TimeSince date={ subscription_date.toISOString?.() ?? subscription_date } />
				</span>
				<span className="actions" role="cell">
					<CommentSettings onUnfollow={ () => undefined } unfollowing={ false } />
				</span>
			</div>
		</div>
	);
};

export default memo( CommentRow );
