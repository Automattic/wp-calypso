import { PreviewPaneProps } from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/types';
import { JetpackPreviewPane } from '../jetpack/jetpack-preview-pane';

export function OverviewFamily( props: PreviewPaneProps ) {
	return <JetpackPreviewPane { ...props } />;
}
