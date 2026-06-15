import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useBlockEditorSettingsQuery } from './use-block-editor-settings-query';

const withBlockEditorSettings = createHigherOrderComponent(
	( Wrapped ) =>
		function WithBlockEditorSettings( props ) {
			const siteId = useSelector( getSelectedSiteId );
			const userLoggedIn = useSelector( isUserLoggedIn );
			const { data, isLoading } = useBlockEditorSettingsQuery( siteId, userLoggedIn );

			return (
				<Wrapped
					{ ...props }
					blockEditorSettings={ data }
					areBlockEditorSettingsLoading={ isLoading }
				/>
			);
		},
	'withBlockEditorSettings'
);

export default withBlockEditorSettings;
