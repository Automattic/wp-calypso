import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import Sidebar from '../sidebar';
import useAmplifyMenuItems from './hooks/use-amplify-menu-items';
import useBackToOverviewButtonProps from './hooks/use-back-to-overview-button-props';
import { A4A_AMPLIFY_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function AmplifySidebar( { path }: Props ) {
	const menuItems = useAmplifyMenuItems( path );
	const backButtonProps = useBackToOverviewButtonProps( 'amplify' );

	return (
		<Sidebar
			path={ A4A_AMPLIFY_LINK }
			title={
				<div className="sidebar-menu-item__title-with-badge">
					<span>{ __( 'Amplify' ) }</span>
					<Badge intent="draft">{ __( 'Beta' ) }</Badge>
				</div>
			}
			backButtonProps={ backButtonProps }
			menuItems={ menuItems }
			withUserProfileFooter
		/>
	);
}
