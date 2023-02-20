import type { SiteNode } from '../types';

import './style.scss';

interface Props {
	site: SiteNode;
}

export const SiteExpandedContent = ( { site }: Props ) => {
	return (
		<div className="site-expanded-content">
			Expanded content for { site.value.blog_id } | { site.value.url }
		</div>
	);
};
