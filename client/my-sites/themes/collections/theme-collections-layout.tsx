import { PatternAssemblerCta, isAssemblerSupported } from '@automattic/design-picker';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import getSiteAssemblerUrl from 'calypso/components/themes-list/get-site-assembler-url';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { THEME_COLLECTIONS } from 'calypso/my-sites/themes/collections/collection-definitions';
import ShowcaseThemeCollection from 'calypso/my-sites/themes/collections/showcase-theme-collection';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

type OnSeeAll = {
	tier?: string;
	filter?: string;
};

export interface ThemeCollectionsLayoutProps {
	getActionLabel: ( themeId: string ) => string;
	getOptions: ( themeId: string ) => void;
	getScreenshotUrl: ( themeId: string ) => string;
	onSeeAll: ( object: OnSeeAll ) => void;
}

const collections = Object.values( THEME_COLLECTIONS ).sort( () => Math.random() - 0.5 );

function ThemeCollectionsPatternAssemblerCta() {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSite = useSelector( getSelectedSite );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const siteEditorUrl = useSelector( ( state: object ) =>
		getSiteEditorUrl( state, selectedSiteId, {
			canvas: 'edit',
			assembler: '1',
		} )
	);
	const onClick = () => {
		const shouldGoToAssemblerStep = isAssemblerSupported();

		recordTracksEvent( 'calypso_themeshowcase_pattern_assembler_cta_click', {
			goes_to_assembler_step: shouldGoToAssemblerStep,
		} );

		const destinationUrl = getSiteAssemblerUrl( {
			isLoggedIn,
			selectedSite,
			shouldGoToAssemblerStep,
			siteEditorUrl,
		} );
		window.location.assign( destinationUrl );
	};
	return <PatternAssemblerCta onButtonClick={ onClick } />;
}

function ThemeCollectionsLayout( props: ThemeCollectionsLayoutProps ) {
	const { onSeeAll } = props;

	const showcaseThemeCollections = collections.map( ( collection, index ) => {
		const { filter, tier } = collection.query;
		return (
			<ShowcaseThemeCollection
				key={ collection.collectionSlug }
				{ ...collection }
				{ ...props }
				onSeeAll={ () => onSeeAll( { tier, filter } ) }
				collectionIndex={ index }
			/>
		);
	} );

	showcaseThemeCollections.splice(
		3,
		0,
		<ThemeCollectionsPatternAssemblerCta key="showcase-theme-collections-pattern-assembler-cta" />
	);

	return showcaseThemeCollections;
}

export default memo( ThemeCollectionsLayout );
