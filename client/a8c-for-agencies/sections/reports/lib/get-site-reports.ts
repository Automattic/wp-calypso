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
			// Sort reports by createdAt (newest first)
			const sortedReports = siteReports.sort(
				( a, b ) => new Date( b.createdAt ).getTime() - new Date( a.createdAt ).getTime()
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
				// Sort groups by latest report's createdAt (newest first)
				new Date( b.latestReport.createdAt ).getTime() -
				new Date( a.latestReport.createdAt ).getTime()
		);
};
