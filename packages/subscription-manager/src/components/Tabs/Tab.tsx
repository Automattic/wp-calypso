/* eslint-disable no-restricted-imports */
/**
 * External dependencies
 */
import { useCurrentRoute } from 'calypso/components/route';
import NavTabItem from 'calypso/components/section-nav/item';

type TabProps = {
	path: string;
	children?: React.ReactNode;
};

const Tab = ( { path, children }: TabProps ) => {
	const { currentRoute } = useCurrentRoute();
	return (
		<NavTabItem path={ path } selected={ currentRoute === path }>
			{ children }
		</NavTabItem>
	);
};

export default Tab;
