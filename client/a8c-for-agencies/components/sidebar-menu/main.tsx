import Sidebar from '../sidebar';
import useMainMenuItems from './hooks/use-main-menu-items';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const menuItems = useMainMenuItems( path );

	return <Sidebar path="" menuItems={ menuItems } withUserProfileFooter />;
}
