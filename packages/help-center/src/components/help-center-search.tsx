/* eslint-disable no-restricted-imports */
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import InlineHelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useHelpCenterSearch } from '../hooks';
import { useContextBasedSearchMapping } from '../hooks/use-context-based-search-mapping';
import { useHelpSearchQuery } from '../hooks/use-help-search-query';
import { HELP_CENTER_STORE } from '../stores';
import { HelpCenterLaunchpad } from './help-center-launchpad';
import { HelpCenterMoreResources } from './help-center-more-resources';
import HelpCenterRecentConversations from './help-center-recent-conversations';
import HelpCenterSearchResults from './help-center-search-results';
import { BlockedZendeskNotice } from './notices';
import type { HelpCenterSelect } from '@automattic/data-stores';

import './help-center-search.scss';
import './help-center-launchpad.scss';

type HelpCenterSearchProps = {
	onSearchChange?: ( query: string ) => void;
	currentRoute?: string;
};

export const HelpCenterSearch = ( { onSearchChange, currentRoute }: HelpCenterSearchProps ) => {
	const locale = useLocale();
	const { sectionName, site, currentUser, source } = useHelpCenterContext();
	const { searchQuery, setSearchQueryAndEmailSubject, redirectToArticle } =
		useHelpCenterSearch( onSearchChange );

	const contextTerm = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getContextTerm(),
		[]
	);
	const { contextSearch } = useContextBasedSearchMapping( currentRoute );

	const { data: searchData, isLoading: isSearching } = useHelpSearchQuery(
		searchQuery || contextTerm || contextSearch, // If there's a query, we don't context search
		locale,
		currentRoute,
		source
	);

	const isSiteOwner = site?.site_owner === currentUser?.ID;
	const launchpadEnabled = site?.options?.launchpad_screen === 'full' && isSiteOwner;

	return (
		<div className="inline-help__search">
			<HelpCenterRecentConversations />
			<BlockedZendeskNotice />
			{ launchpadEnabled && <HelpCenterLaunchpad /> }
			{ ! isSearching && (
				<InlineHelpSearchCard
					searchQuery={ searchQuery }
					onSearch={ setSearchQueryAndEmailSubject }
					location="help-center"
					isVisible
					placeholder={ __( 'Search guides…', __i18n_text_domain__ ) }
					sectionName={ sectionName }
					useSearchControl
				/>
			) }
			<HelpCenterSearchResults
				onSelect={ redirectToArticle }
				searchQuery={ searchQuery || '' }
				openAdminInNewTab
				location="help-center"
				isSearching={ isSearching }
				searchData={ searchData }
				currentRoute={ currentRoute }
			/>
			{ ! searchQuery && ! isSearching && <HelpCenterMoreResources /> }
		</div>
	);
};
