import type { SiteReports, Report } from '../types';

export const getSiteReports = ( reports: Report[] ): SiteReports[] => {
	if ( ! reports ) {
		return [];
	}

	const grouped = reports.reduce(
		( acc, report ) => {
			if ( ! acc[ report.site ] ) {
				acc[ report.site ] = [];
			}
			acc[ report.site ].push( report );
			return acc;
		},
		{} as Record< string, Report[] >
	);

	return Object.entries( grouped )
		.map( ( [ site, siteReports ] ) => {
			// Sort reports by created_at (newest first)
			const sortedReports = siteReports.sort(
				( a, b ) => new Date( b.created_at ).getTime() - new Date( a.created_at ).getTime()
			);

			const latestReport = sortedReports[ 0 ];

			return {
				site,
				reports: sortedReports,
				totalReports: siteReports.length,
				latestReport,
			};
		} )
		.sort(
			( a, b ) =>
				// Sort groups by latest report's created_at (newest first)
				new Date( b.latestReport.created_at ).getTime() -
				new Date( a.latestReport.created_at ).getTime()
		);
};
