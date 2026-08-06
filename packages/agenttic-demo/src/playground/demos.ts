import type React from 'react';
import EmbeddedDemo from '../EmbeddedDemo';
import FloatingDemo from '../FloatingDemo';
import FloatingCompactDemo from '../FloatingCompactDemo';
import SiteSpecDemo from '../SiteSpecDemo';
import SidebarDemo from '../SidebarDemo';

export interface DemoDefinition {
	id: string;
	label: string;
	component: React.ComponentType< any >;
	/** Extra props merged into the component (e.g. preset floating state). */
	props?: Record< string, unknown >;
}

export const DEMOS: DemoDefinition[] = [
	{ id: 'embedded', label: 'Embedded', component: EmbeddedDemo },
	{ id: 'floating', label: 'Floating', component: FloatingDemo },
	{
		id: 'floating-minimized',
		label: 'Minimized',
		component: FloatingDemo,
		props: { floatingChatState: 'minimized', triggerTitle: 'Ask AI' },
	},
	{
		id: 'floating-compact',
		label: 'Compact',
		component: FloatingCompactDemo,
	},
	{ id: 'site-spec', label: 'Site Spec', component: SiteSpecDemo },
	{ id: 'sidebar', label: 'Sidebar', component: SidebarDemo },
];
