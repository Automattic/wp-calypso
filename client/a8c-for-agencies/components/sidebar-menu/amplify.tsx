import page from '@automattic/calypso-router';
import { Badge } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import Sidebar from '../sidebar';
import useAmplifyMenuItems from './hooks/use-amplify-menu-items';
import { A4A_AMPLIFY_LINK, A4A_OVERVIEW_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function AmplifySidebar( { path }: Props ) {
	const menuItems = useAmplifyMenuItems( path );

	return (
		<Sidebar
			path={ A4A_AMPLIFY_LINK }
			title={
				<div className="sidebar-menu-item__title-with-badge">
					<span>{ __( 'Amplify' ) }</span>
					<Badge type="info">{ __( 'Alpha' ) }</Badge>
				</div>
			}
			backButtonProps={ {
				label: __( 'Back to overview' ),
				icon: chevronLeft,
				onClick: () => {
					page( A4A_OVERVIEW_LINK );
				},
			} }
			menuItems={ menuItems }
			withUserProfileFooter
		/>
	);
}
