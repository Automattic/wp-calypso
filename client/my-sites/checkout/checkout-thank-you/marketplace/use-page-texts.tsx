import { useTranslate } from 'i18n-calypso';
import { hasMultipleProductTypes } from './utils';

export function usePageTexts( {
	pluginSlugs,
	themeSlugs,
	pluginTitle,
	pluginSubtitle,
	themeTitle,
	themeSubtitle,
}: {
	pluginSlugs: string[];
	themeSlugs: string[];
	pluginTitle: string;
	pluginSubtitle: string;
	themeTitle: string;
	themeSubtitle: string;
} ): [ string, string ] {
	const multipleProductTypes = hasMultipleProductTypes( [ pluginSlugs, themeSlugs ] );
	const [ defaultTitle, defaultSubTitle ] = useDefaultPageTexts();

	if ( multipleProductTypes ) {
		return [ defaultTitle, defaultSubTitle ];
	}

	if ( pluginSlugs.length > 0 ) {
		return [ pluginTitle, pluginSubtitle ];
	}

	if ( themeSlugs.length > 0 ) {
		return [ themeTitle, themeSubtitle ];
	}

	return [ '', '' ];
}

function useDefaultPageTexts(): [ string, string ] {
	const translate = useTranslate();

	return [
		translate( 'Congrats on your investment!' ),
		translate(
			"We're thrilled to see you invest in your online presence and can't wait to see what the future holds for you."
		),
	];
}
