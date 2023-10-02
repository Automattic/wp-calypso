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
	tier: 'marketplace',
	filter: '',
	search: '',
	collection: 'recommended',
};

function PartnerThemesCollection( props: ThemesCollectionProps ): ReactElement {
	return (
		<>
			<QueryThemes query={ query } siteId="wpcom" />
			<ThemeCollection
				{ ...props }
				showMoreLink={ `/themes/marketplace/${ props.siteId ?? '' }` }
				heading={ translate( 'Partner Themes' ) }
				subheading={ <p>Lorem ipsum mockup subheading</p> }
				collectionSlug="partner-themes"
			/>
		</>
	);
}

export default connect(
	createWpcomThemeCollectionMapStateToProps( query ),
	null
)( localize( PartnerThemesCollection ) );
