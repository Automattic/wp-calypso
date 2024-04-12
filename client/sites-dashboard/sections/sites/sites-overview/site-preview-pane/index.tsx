import classNames from 'classnames';
import React from 'react';
import SitePreviewPaneHeader from './site-preview-pane-header';
import { PreviewPaneProps } from './types';

import './style.scss';

export default function SitePreviewPane( {
	site,
	closeSitePreviewPane,
	className,
}: PreviewPaneProps ) {
	return (
		<div className={ classNames( 'site-preview__pane', className ) }>
			<SitePreviewPaneHeader site={ site } closeSitePreviewPane={ closeSitePreviewPane } />
			PREVIEW PANE
		</div>
	);
}
