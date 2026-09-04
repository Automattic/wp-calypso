import page from '@automattic/calypso-router';
import { addLocaleToPathLocaleInFront, useLocale } from '@automattic/i18n-utils';
import { useTranslate, fixMe } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { addQueryArgs } from 'calypso/lib/url';
import DiscoverNavigation from 'calypso/reader/discover/components/navigation';
import DiscoverTagsNavigation from 'calypso/reader/discover/components/tags-navigation';
import ReaderOnboardingGate from 'calypso/reader/onboarding-rsm/gate';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	RECOMMENDED_TAB,
	FRESHLY_PRESSED_TAB,
	TAGS_TAB,
	LATEST_TAB,
	SEARCH_TAB,
} from '../../helper';
import type { JSX } from 'react';

export interface DiscoverHeaderAndNavigationProps {
	selectedTab: string;
	selectedTag?: string;
}

function getSubtitle( selectedTab: string, translate: ReturnType< typeof useTranslate > ) {
	switch ( selectedTab ) {
		case TAGS_TAB:
			return fixMe( {
				text: 'Browse posts by popular tags.',
				newCopy: translate( 'Browse posts by popular tags.' ),
				oldCopy: '', // No previous translation available.
			} );
		case RECOMMENDED_TAB:
			return translate( 'Explore popular blogs that inspire, educate, and entertain.' );
		case SEARCH_TAB:
			return translate( 'Search for specific topics, authors, or blogs.' );
		case LATEST_TAB:
			return fixMe( {
				text: 'Explore recent posts related to the tags you follow.',
				newCopy: translate( 'Explore recent posts related to the tags you follow.' ),
				oldCopy: '', // No previous translation available.
			} );
		case FRESHLY_PRESSED_TAB:
			return translate( "Freshly Pressed highlights our team's favorite blog posts." );
	}
}

export default function DiscoverHeaderAndNavigation(
	props: DiscoverHeaderAndNavigationProps
): JSX.Element {
	const { selectedTab, selectedTag } = props;
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentLocale = useLocale();
	const translate = useTranslate();

	function handleTagSelect( tag: string ): void {
		const redirectPath = '/discover/tags';
		const localizedPath = addLocaleToPathLocaleInFront( redirectPath, currentLocale );
		page.replace( addQueryArgs( { selectedTag: tag }, localizedPath ) );
	}

	return (
		<>
			{ isLoggedIn && (
				<NavigationHeader
					title={ translate( 'Discover' ) }
					subtitle={ getSubtitle( selectedTab, translate ) }
					className="discover-stream-header"
				/>
			) }
			<ReaderOnboardingGate />
			<DiscoverNavigation selectedTab={ selectedTab } />

			{ selectedTab === 'tags' && (
				<DiscoverTagsNavigation selectedTag={ selectedTag } onTagSelect={ handleTagSelect } />
			) }
		</>
	);
}
