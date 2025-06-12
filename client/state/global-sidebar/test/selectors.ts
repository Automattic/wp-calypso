import { isPlansPageUntangled } from 'calypso/lib/plans/untangling-plans-experiment';
import sections from 'calypso/sections';
import { getSidebarType, SidebarType } from '../selectors';

jest.mock( 'calypso/lib/plans/untangling-plans-experiment', () => ( {
	isPlansPageUntangled: jest.fn(),
} ) );

interface Site {
	ID: number;
	adminInterface?: string;
	isPlansPageUntangled?: boolean;
}

describe( 'getSidebarType', () => {
	const site: Site = {
		ID: 123,
	};
	const siteDefault: Site = {
		ID: 123,
		adminInterface: 'calypso',
	};
	const siteClassic: Site = {
		ID: 123,
		adminInterface: 'wp-admin',
	};
	const sitePlansTangled: Site = {
		ID: 123,
		isPlansPageUntangled: false,
	};
	const sitePlansUntangled: Site = {
		ID: 123,
		isPlansPageUntangled: true,
	};

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		[ null, '/sites', SidebarType.Global ],
		[ null, '/p2s', SidebarType.Global ],
		[ null, '/domains/manage', SidebarType.Global ],
		[ null, '/themes', SidebarType.Global ],
		[ null, '/plugins', SidebarType.Global ],
		[ null, '/plugins/scheduled-updates', SidebarType.Global ],
		[ null, '/me', SidebarType.Global ],
		[ null, '/reader', SidebarType.Global ],

		[ site, '/overview/example.com', SidebarType.GlobalCollapsed ],
		[ site, '/hosting-features/example.com', SidebarType.GlobalCollapsed ],
		[ site, '/github-deployments/example.com', SidebarType.GlobalCollapsed ],
		[ site, '/staging-site/example.com', SidebarType.GlobalCollapsed ],
		[ site, '/site-monitoring/example.com', SidebarType.GlobalCollapsed ],
		[ site, '/site-logs/example.com', SidebarType.GlobalCollapsed ],
		[ site, '/sites/performance/example.com', SidebarType.GlobalCollapsed ],
		[ site, '/sites/settings/site/example.com', SidebarType.GlobalCollapsed ],
		[ site, '/sites/settings/server/example.com', SidebarType.GlobalCollapsed ],

		[ null, '/domains/manage/all/overview/domain.com', SidebarType.GlobalCollapsed ],
		[ null, '/domains/manage/all/email/domain.com', SidebarType.GlobalCollapsed ],
		[ null, '/domains/manage/all/contact-info/edit/domain.com', SidebarType.GlobalCollapsed ],

		[ null, '/plugins/manage/sites', SidebarType.GlobalCollapsed ],
		[ null, '/plugins/scheduled-updates/create', SidebarType.GlobalCollapsed ],
		[ null, '/plugins/scheduled-updates/edit/000-daily-86400-06:00', SidebarType.GlobalCollapsed ],

		[ siteDefault, '/home/example.com', SidebarType.UnifiedSiteDefault ],
		[ siteDefault, '/domains/manage/example.com', SidebarType.UnifiedSiteDefault ],
		[ siteDefault, '/themes/example.com', SidebarType.UnifiedSiteDefault ],
		[ siteDefault, '/plugins/example.com', SidebarType.UnifiedSiteDefault ],

		[ siteClassic, '/home/example.com', SidebarType.UnifiedSiteClassic ],
		[ siteClassic, '/domains/manage/example.com', SidebarType.UnifiedSiteClassic ],
		[ siteClassic, '/themes/example.com', SidebarType.UnifiedSiteClassic ],
		[ siteClassic, '/plugins/example.com', SidebarType.UnifiedSiteClassic ],

		[ null, '/start', SidebarType.None ],
		[ null, '/setup', SidebarType.None ],

		[ sitePlansTangled, '/plans/example.com', SidebarType.UnifiedSiteDefault ],
		[ sitePlansUntangled, '/plans/example.com', SidebarType.GlobalCollapsed ],
	] )( 'should return correct sidebar type', ( selectedSite, route, expected ) => {
		const section =
			sections.findLast( ( s ) =>
				s.paths.some(
					( path ) =>
						route.startsWith( path ) &&
						[ 'me', 'reader', 'sites', 'sites-dashboard' ].includes( s.group || '' )
				)
			) || ( {} as any ); // eslint-disable-line @typescript-eslint/no-explicit-any

		const siteId = selectedSite?.ID || null;
		const state = siteId
			? {
					sites: {
						items: {
							[ siteId ]: {
								options: {
									wpcom_admin_interface: selectedSite?.adminInterface,
								},
							},
						},
					},
			  }
			: {};

		if ( selectedSite?.isPlansPageUntangled ) {
			( isPlansPageUntangled as jest.Mock ).mockReturnValue( true );
		}

		const actual = getSidebarType( {
			state,
			siteId,
			section,
			route,
		} );
		expect( actual ).toEqual( expected );
	} );
} );
