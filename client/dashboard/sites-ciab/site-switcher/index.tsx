import { __experimentalHStack as HStack, MenuGroup, MenuItem, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import { SiteSwitcherBase } from '../../sites/site-switcher/base';

const CIABSiteSwitcher = () => {
	const { recordTracksEvent } = useAnalytics();
	const handleAddNewStore = () => {
		recordTracksEvent( 'calypso_dashboard_site_switcher_new_site_button_click', {
			action: 'big-sky',
			context: 'ciab-sites-dashboard',
		} );

		const addNewStoreUrl = addQueryArgs( '/setup/ai-site-builder-spec', {
			source: 'ciab-sites-dashboard',
			ref: 'new-site-popover',
		} );

		window.location.href = addNewStoreUrl;
	};

	return (
		<SiteSwitcherBase>
			{ () => (
				<MenuGroup>
					<MenuItem onClick={ handleAddNewStore }>
						<HStack justify="flex-start" alignment="center">
							<Icon icon={ plus } />
							<span>{ __( 'Add new store', 'Commerce in a box' ) }</span>
						</HStack>
					</MenuItem>
				</MenuGroup>
			) }
		</SiteSwitcherBase>
	);
};

export default CIABSiteSwitcher;
