import Sidebar from '../sidebar';
import useClientMenuItems from './hooks/use-client-menu-items';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const menuItems = useClientMenuItems( path );

	return <Sidebar path="" menuItems={ menuItems } withUserProfileFooter />;
}
