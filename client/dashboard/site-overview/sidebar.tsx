import { __experimentalVStack as VStack } from '@wordpress/components';
import SiteCard from './site-card';

/**
 * Sidebar component for the site overview page
 */
export default function Sidebar() {
	return (
		<VStack spacing={ 4 }>
			<SiteCard />
		</VStack>
	);
}
