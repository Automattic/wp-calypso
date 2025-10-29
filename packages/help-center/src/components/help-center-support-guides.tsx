/* eslint-disable no-restricted-imports */
import { __ } from '@wordpress/i18n';
import InlineHelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useHelpCenterSearch } from '../hooks';
import HelpCenterSearchResults from './help-center-search-results';
import './help-center-search.scss';
import './help-center-launchpad.scss';

type HelpCenterSupportGuidesProps = {
	onSearchChange?: ( query: string ) => void;
	currentRoute?: string;
};

export const HelpCenterSupportGuides = ( {
	onSearchChange,
	currentRoute,
}: HelpCenterSupportGuidesProps ) => {
	const { sectionName } = useHelpCenterContext();
	const { searchQuery, setSearchQueryAndEmailSubject, redirectToArticle } =
		useHelpCenterSearch( onSearchChange );

	return (
		<div className="inline-help__search">
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
		</div>
	);
};
