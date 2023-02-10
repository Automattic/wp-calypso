import type { SiteData } from '../types';

import './style.scss';

interface Props {
	site: SiteData;
}

export const SiteExpandedContent = ( { site }: Props ) => {
	return (
		<div className="site-expanded-content">
			Expanded content for { site.value.blog_id } | { site.value.url }
		</div>
	);
};
