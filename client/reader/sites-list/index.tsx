import './style.scss';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import { ReaderSite, ReaderSiteItem } from './site-item';

interface ReaderSitesListProps
	extends Pick<
		ComponentProps< typeof ReaderSiteItem >,
		'variant' | 'siteIconSize' | 'followSource'
	> {
	sites: ReaderSite[];
}

export function ReaderSitesList( props: ReaderSitesListProps ): JSX.Element {
	const { sites, variant = 'default', siteIconSize, followSource } = props;

	return (
		<ul className={ clsx( 'reader-sites-list', `is-${ variant }-view` ) }>
			{ sites
				.filter( ( site ) => site.feedUrl )
				.map(
					( site ): JSX.Element => (
						<ReaderSiteItem
							key={ `reader-site-item-${ site.feedId || site.feedUrl }` }
							site={ site }
							followSource={ followSource }
							variant={ variant }
							siteIconSize={ siteIconSize }
						/>
					)
				) }
		</ul>
	);
}
