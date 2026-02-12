/* eslint-disable no-restricted-imports */
import { __ } from '@wordpress/i18n';
import InlineHelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useHelpCenterSearch } from '../hooks';
import { HelpCenterLaunchpad } from './help-center-launchpad';
import { HelpCenterMoreResources } from './help-center-more-resources';
import HelpCenterRecentConversations from './help-center-recent-conversations';
import HelpCenterSearchResults from './help-center-search-results';
import { BlockedZendeskNotice } from './notices';
import './help-center-search.scss';
import './help-center-launchpad.scss';

type HelpCenterSearchProps = {
	onSearchChange?: ( query: string ) => void;
	currentRoute?: string;
};

export const HelpCenterSearch = ( { onSearchChange, currentRoute }: HelpCenterSearchProps ) => {
	const { sectionName, site, currentUser, hideMoreResources, disableChatSupport } =
		useHelpCenterContext();
	const { searchQuery, setSearchQueryAndEmailSubject, redirectToArticle } =
		useHelpCenterSearch( onSearchChange );

	const isSiteOwner = site?.site_owner === currentUser?.ID;
	const launchpadEnabled = site?.options?.launchpad_screen === 'full' && isSiteOwner;

	return (
		<div className="inline-help__search">
			{ ! disableChatSupport && (
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
			{ ! searchQuery && ! hideMoreResources && <HelpCenterMoreResources /> }
		</div>
	);
};
