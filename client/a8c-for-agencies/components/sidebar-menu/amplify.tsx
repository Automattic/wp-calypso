import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useOptInPreview } from 'calypso/dashboard/agency/opt-in-preview/store';
import Sidebar from '../sidebar';
import useAmplifyMenuItems from './hooks/use-amplify-menu-items';
import { A4A_AMPLIFY_LINK, A4A_OVERVIEW_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function AmplifySidebar( { path }: Props ) {
	const menuItems = useAmplifyMenuItems( path );
	// Agencies on the Multi-site Dashboard open Amplify from its sidebar, so a
	// way back to this app's overview would only confuse them.
	const hideBackButton = useOptInPreview()?.agency === 'opted-in';

	return (
		<Sidebar
			path={ A4A_AMPLIFY_LINK }
			title={
				<div className="sidebar-menu-item__title-with-badge">
					<span>{ __( 'Amplify' ) }</span>
					<Badge intent="draft">{ __( 'Beta' ) }</Badge>
				</div>
			}
			backButtonProps={
				hideBackButton
					? undefined
					: {
							label: __( 'Back to overview' ),
							icon: chevronLeft,
							onClick: () => {
								page( A4A_OVERVIEW_LINK );
							},
						}
			}
			menuItems={ menuItems }
			withUserProfileFooter
		/>
	);
}
