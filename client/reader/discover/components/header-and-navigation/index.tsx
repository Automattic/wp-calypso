import page from '@automattic/calypso-router';
import { addLocaleToPathLocaleInFront, useLocale } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate, fixMe } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { addQueryArgs } from 'calypso/lib/url';
import DiscoverNavigation from 'calypso/reader/discover/components/navigation';
import DiscoverTagsNavigation from 'calypso/reader/discover/components/tags-navigation';
import ReaderOnboardingGate from 'calypso/reader/onboarding/gate';
import { RECOMMENDED_TAB, FRESHLY_PRESSED_TAB, TAGS_TAB, LATEST_TAB } from '../../helper';
import type { JSX } from 'react';

export interface DiscoverHeaderAndNavigationProps {
	selectedTab: string;
	selectedTag?: string;
}

export default function DiscoverHeaderAndNavigation(
	props: DiscoverHeaderAndNavigationProps
): JSX.Element {
	const { selectedTab, selectedTag } = props;
	const currentLocale = useLocale();
	const translate = useTranslate();

	function handleTagSelect( tag: string ): void {
		const redirectPath = '/discover/tags';
		const localizedPath = addLocaleToPathLocaleInFront( redirectPath, currentLocale );
		page.replace( addQueryArgs( { selectedTag: tag }, localizedPath ) );
	}

	let subHeaderText;
	switch ( selectedTab ) {
		case TAGS_TAB:
			subHeaderText = fixMe( {
				text: 'Browse posts by popular tags.',
				newCopy: translate( 'Browse posts by popular tags.' ),
				oldCopy: '', // No previous translation available.
			} );
			break;
		case RECOMMENDED_TAB:
			subHeaderText = translate( 'Explore popular blogs that inspire, educate, and entertain.' );
			break;
		case LATEST_TAB:
			subHeaderText = fixMe( {
				text: 'Explore recent posts related to the tags you follow.',
				newCopy: translate( 'Explore recent posts related to the tags you follow.' ),
				oldCopy: '', // No previous translation available.
			} );
			break;

		case FRESHLY_PRESSED_TAB:
			subHeaderText = translate( "Freshly Pressed highlights our team's favorite blog posts." );
			break;
	}

	return (
		<>
			<NavigationHeader
				title={ translate( 'Discover' ) }
				subtitle={ subHeaderText }
				className={ clsx( 'discover-stream-header' ) }
			/>
			<ReaderOnboardingGate />
			<DiscoverNavigation selectedTab={ selectedTab } />

			{ selectedTab === 'tags' && (
				<DiscoverTagsNavigation selectedTag={ selectedTag } onTagSelect={ handleTagSelect } />
			) }
		</>
	);
}
