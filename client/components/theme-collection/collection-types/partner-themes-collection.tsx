import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import * as React from 'react';
import QueryThemes from 'calypso/components/data/query-themes';
import ThemeCollection from 'calypso/components/theme-collection';
import { ThemesCollectionProps } from 'calypso/components/theme-collection/themes-collection-props';
import { useThemeCollection } from 'calypso/components/theme-collection/use-theme-collection';

const query = {
	collection: 'recommended',
	filter: '',
	number: 10,
	page: 1,
	search: '',
	tier: 'marketplace',
};

export default function PartnerThemesCollection( props: ThemesCollectionProps ): ReactElement {
	const translate = useTranslate();
	const { siteId, themes } = useThemeCollection( query );
	return (
		<>
			<QueryThemes query={ query } siteId="wpcom" />
			<ThemeCollection
				collectionSlug="partner-themes"
				heading={ translate( 'Partner Themes' ) }
				siteId={ siteId }
				subheading={ <p>Lorem ipsum mockup subheading</p> }
				themes={ themes }
				{ ...props }
			/>
		</>
	);
}
