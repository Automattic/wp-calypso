/* eslint-disable no-restricted-imports */
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import InlineHelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { useFeatureConfig, useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useHelpCenterSearch, useGetHistoryChats } from '../hooks';
import { useContextBasedSearchMapping } from '../hooks/use-context-based-search-mapping';
import { useHelpSearchQuery } from '../hooks/use-help-search-query';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterLaunchpad } from './help-center-launchpad';
import { HelpCenterMoreResources } from './help-center-more-resources';
import HelpCenterRecentConversations from './help-center-recent-conversations';
import HelpCenterSearchResults from './help-center-search-results';
import { BlockedZendeskNotice } from './notices';
import PlaceholderLines from './placeholder-lines';
import './help-center-search.scss';
import './help-center-launchpad.scss';
import type { HelpCenterSelect } from '@automattic/data-stores';

type HelpCenterSearchProps = {
	onSearchChange?: ( query: string ) => void;
	currentRoute?: string;
};

export const HelpCenterSearch = ( { onSearchChange, currentRoute }: HelpCenterSearchProps ) => {
	const { sectionName, site, currentUser, product } = useHelpCenterContext();
	const featureConfig = useFeatureConfig();
	const { searchQuery, setSearchQueryAndEmailSubject, redirectToArticle } =
		useHelpCenterSearch( onSearchChange );

	const isSiteOwner = site?.site_owner === currentUser?.ID;
	const launchpadEnabled = site?.options?.launchpad_screen === 'full' && isSiteOwner;

	// Track loading states to coordinate rendering and avoid content popping in at different times.
	const { isLoadingInteractions } = useGetHistoryChats();
	const locale = useLocale();
	const contextTerm = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getContextTerm(),
		[]
	);
	const { contextSearch } = useContextBasedSearchMapping( currentRoute );
	const { isLoading: isLoadingSearchResults } = useHelpSearchQuery(
		searchQuery || contextTerm || contextSearch,
		locale,
		currentRoute,
		product
	);

	const isInitialLoading =
		! searchQuery &&
		( isLoadingSearchResults || ( featureConfig.chat.enabled && isLoadingInteractions ) );

	if ( isInitialLoading ) {
		return (
			<div className="inline-help__search">
				<PlaceholderLines lines={ 4 } />
			</div>
		);
	}

	return (
		<div className="inline-help__search">
			{ featureConfig.home.recentConversations && (
				<>
					<HelpCenterRecentConversations />
					<BlockedZendeskNotice />
				</>
			) }
			{ launchpadEnabled && <HelpCenterLaunchpad /> }
			<InlineHelpSearchCard
				searchQuery={ searchQuery }
				onSearch={ setSearchQueryAndEmailSubject }
				location="help-center"
				isVisible
				placeholder={ __( 'Search guides…', __i18n_text_domain__ ) }
				sectionName={ sectionName }
				useSearchControl
			/>
			<HelpCenterSearchResults
				onSelect={ redirectToArticle }
				searchQuery={ searchQuery || '' }
				openAdminInNewTab
				placeholderLines={ 4 }
				location="help-center"
				currentRoute={ currentRoute }
			/>
			{ ! searchQuery && featureConfig.moreResources.visible && <HelpCenterMoreResources /> }
		</div>
	);
};
