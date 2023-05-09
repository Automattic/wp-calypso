import SectionExport from 'calypso/my-sites/exporter/section-export';

export function exportSite( context, next ) {
	context.primary = <SectionExport />;
	next();
}
