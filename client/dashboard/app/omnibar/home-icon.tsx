import { A4AOmnibarHomeIcon } from '../../app-a4a/omnibar-home-icon';
import { OmnibarHomeIcon } from './home';
import type { DashboardType } from '../types';

export function getDashboardOmnibarHomeIcon( dashboard: DashboardType | undefined ) {
	if ( dashboard === 'a4a' ) {
		return <A4AOmnibarHomeIcon />;
	}
	return <OmnibarHomeIcon />;
}
