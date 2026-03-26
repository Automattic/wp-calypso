import type { SwitcherProps } from '../../components/switcher';
import type { Site } from '@automattic/api-core';

export type SiteSwitcherProps = Pick< SwitcherProps< Site >, 'icon' | 'renderToggle' > & {
	site: Site;
};
