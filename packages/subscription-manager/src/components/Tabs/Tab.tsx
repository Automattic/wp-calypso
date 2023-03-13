/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useCurrentRoute } from 'calypso/components/route';
import NavTabItem from 'calypso/components/section-nav/item';

type TabProps = {
	path: string;
	count?: number;
	children?: React.ReactNode;
};

const Tab = ( { count, path, children }: TabProps ) => {
	const { currentRoute } = useCurrentRoute();
	return (
		<NavTabItem path={ path } count={ count } selected={ currentRoute === path }>
			{ children }
		</NavTabItem>
	);
};

export default Tab;
