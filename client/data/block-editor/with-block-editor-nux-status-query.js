import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useBlockEditorNuxStatusQuery } from './use-block-editor-nux-status-query';

const withBlockEditorNuxStatus = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const { data } = useBlockEditorNuxStatusQuery( siteId );
		return <Wrapped { ...props } blockEditorNuxStatus={ data } />;
	},
	'withBlockEditorNuxStatus'
);

export default withBlockEditorNuxStatus;
