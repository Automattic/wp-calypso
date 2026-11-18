import { SitePreview } from '../../steps-repository/components/site-preview';
import type { ReactNode } from 'react';

import './style.scss';

export type ComparedSite = {
	heading: ReactNode;
	url: string;
	address: string;
	/** Accessible label for the site's screenshot. */
	previewLabel: string;
	/** What happens to this site. */
	description?: ReactNode;
};

const ComparedSiteColumn = ( {
	heading,
	url,
	address,
	previewLabel,
	description,
}: ComparedSite ) => (
	<div className="site-comparison__site">
		<div className="site-comparison__label">
			<span className="site-comparison__heading">{ heading }</span>
			<a
				className="site-comparison__address"
				href={ url }
				target="_blank"
				rel="noopener noreferrer"
				title={ address }
			>
				<span className="site-comparison__address-text">{ address }</span> ↗
			</a>
		</div>
		<SitePreview url={ url } label={ previewLabel } />
		{ description && <p className="site-comparison__description">{ description }</p> }
	</div>
);

/**
 * The source and destination of a move side by side, with what happens to each.
 */
export const SiteComparison = ( {
	source,
	destination,
}: {
	source: ComparedSite;
	destination: ComparedSite;
} ) => (
	<div className="site-comparison">
		<ComparedSiteColumn { ...source } />
		<span className="site-comparison__arrow" aria-hidden="true">
			→
		</span>
		<ComparedSiteColumn { ...destination } />
	</div>
);
