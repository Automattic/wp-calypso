import {
	SourceType,
	useQuerySingleTheme,
} from 'calypso/components/data/query-theme/use-query-single-theme';

export default function QuerySingleTheme( props: {
	siteId: number | null;
	themeId: string;
	sourceType: SourceType;
} ) {
	useQuerySingleTheme( props.siteId, props.themeId, props.sourceType );

	return null;
}
