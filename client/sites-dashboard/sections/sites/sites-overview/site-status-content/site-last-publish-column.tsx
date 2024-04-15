import { SiteExcerptData } from '@automattic/sites';
import * as React from 'react';
import TimeSince from 'calypso/components/time-since';

type Props = {
	site: SiteExcerptData;
};

export default function SiteLastPublishColumn( { site }: Props ) {
	return (
		<span className="sites-overview__row-last-publish">
			{ site.options?.updated_at ? <TimeSince date={ site.options.updated_at } /> : '' }
		</span>
	);
}
