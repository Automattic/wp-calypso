import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useBlockEditorSettingsQuery } from './use-block-editor-settings-query';

const withBlockEditorSettings = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const { data } = useBlockEditorSettingsQuery( siteId );

		return <Wrapped { ...props } blockEditorSettings={ data } />;
	},
	'withBlockEditorSettings'
);

export default withBlockEditorSettings;
