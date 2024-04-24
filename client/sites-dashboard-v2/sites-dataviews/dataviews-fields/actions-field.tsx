import { Button, Gridicon } from '@automattic/components';
import * as React from 'react';
import { SiteActions } from '../sites-site-actions';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	openSitePreviewPane: ( site: SiteExcerptData ) => void;
};

const ActionsField = ( { site, openSitePreviewPane }: Props ) => {
	return (
		<div className="sites-dataviews__actions">
			<SiteActions site={ site } />
			<Button
				onClick={ () => openSitePreviewPane( site ) }
				className="site-preview__open"
				borderless
			>
				<Gridicon icon="chevron-right" />
			</Button>
		</div>
	);
};

export default ActionsField;
