import { localize, translate, useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import QueryThemes from 'calypso/components/data/query-themes';
import ThemeCollection from 'calypso/components/theme-collection/index';
import { getThemesForQueryIgnoringPage } from 'calypso/state/themes/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const query = {
	page: 1,
	number: 10,
	tier: 'premium',
	filter: '',
	search: '',
	collection: 'recommended',
};

interface PremiumThemesCollectionProps {
	getScreenshotUrl: ( themeId: string ) => string;
	siteId: string | null;
	getButtonOptions: () => void;
	getActionLabel: () => string;
	isActive: () => boolean;
	getPrice: () => string;
	isInstalling: () => boolean;
	themes: never[];
	translate: ReturnType< typeof useTranslate >;
}

function PremiumThemesCollection( props: PremiumThemesCollectionProps ): ReactElement {
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

const mapStateToProps = ( state: IAppState, ownProps: PremiumThemesCollectionProps ) => {
	const siteId = getSelectedSiteId( state ) as unknown as string;

	const themes = ( getThemesForQueryIgnoringPage( state, 'wpcom', query ) as never[] ) ?? []; // We should change it to a nullable value so that we can use LoadingPlaceholders.
	return {
		...ownProps,
		themes,
		siteId,
	};
};

export default connect( mapStateToProps, null )( localize( PremiumThemesCollection ) );
