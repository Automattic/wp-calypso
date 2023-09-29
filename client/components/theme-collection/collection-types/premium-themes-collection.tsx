import { localize, translate } from 'i18n-calypso';
import { ReactElement } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import QueryThemes from 'calypso/components/data/query-themes';
import ThemeCollection from 'calypso/components/theme-collection';
import { createWpcomThemeCollectionMapStateToProps } from 'calypso/components/theme-collection/create-map-state-to-props';
import { ThemesCollectionProps } from 'calypso/components/theme-collection/themes-collection-props';

const query = {
	page: 1,
	number: 10,
	tier: 'premium',
	filter: '',
	search: '',
	collection: 'recommended',
};

function PremiumThemesCollection( props: ThemesCollectionProps ): ReactElement {
	return (
		<>
			<QueryThemes query={ query } siteId="wpcom" />
			<ThemeCollection
				{ ...props }
				heading={ translate( 'Premium Themes' ) }
				subheading={ <p>Lorem ipsum mockup subheading</p> }
				collectionSlug="premium-themes"
			/>
		</>
	);
}

export default connect(
	createWpcomThemeCollectionMapStateToProps( query ),
	null
)( localize( PremiumThemesCollection ) );
