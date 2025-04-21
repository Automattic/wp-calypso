import { __experimentalVStack as VStack } from '@wordpress/components';
import SiteCard from './site-card';
import type { Site, SiteDomain, Plan } from '../data/types';

/**
 * Sidebar component for the site overview page
 */
export default function Sidebar( props: {
	site: Site;
	phpVersion?: string;
	primaryDomain?: SiteDomain;
	currentPlan: Plan;
} ) {
	return (
		<VStack spacing={ 4 } style={ { minWidth: '300px' } }>
			<SiteCard { ...props } />
		</VStack>
	);
}
