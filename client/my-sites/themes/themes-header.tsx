import NavigationHeader from 'calypso/components/navigation-header';
import './themes-header.scss';

interface Props {
	title: string;
	description: string;
	children: any;
}

const ThemesHeader = ( { title, description, children }: Props ) => {
	return (
		<NavigationHeader title={ title } subtitle={ description }>
			{ children }
		</NavigationHeader>
	);
};

export default ThemesHeader;
