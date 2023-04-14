import { Gridicon } from '@automattic/components';
import { useMemo } from 'react';
import TimeSince from 'calypso/components/time-since';
import type { PendingSiteSubscription } from '@automattic/data-stores/src/reader/types';

export default function PendingSiteRow( {
	site_title,
	site_icon,
	site_url,
	date_subscribed,
}: PendingSiteSubscription ) {
	const hostname = useMemo( () => new URL( site_url ).hostname, [ site_url ] );
	const siteIcon = useMemo( () => {
		if ( site_icon ) {
			return <img className="icon" src={ site_icon } alt={ site_title } />;
		}
		return <Gridicon className="icon" icon="globe" size={ 48 } />;
	}, [ site_icon, site_title ] );

	return (
		<li className="row" role="row">
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
				<TimeSince date={ date_subscribed.toISOString?.() ?? date_subscribed } />
			</span>
			<span className="actions" role="cell"></span>
		</li>
	);
}
