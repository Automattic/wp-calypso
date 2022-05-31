/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable no-restricted-imports */
import { useState, useCallback } from '@wordpress/element';
import { useHistory } from 'react-router-dom';
import InlineHelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import InlineHelpSearchResults from 'calypso/blocks/inline-help/inline-help-search-results';
import './help-center-search.scss';
import { HelpCenterMoreResources } from './help-center-more-resources';
import { SibylArticles } from './help-center-sibyl-articles';

export const HelpCenterSearch = () => {
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const history = useHistory();

	const redirectToArticle = useCallback(
		( event, result ) => {
			const search = new URLSearchParams( {
				postId: result.post_id,
				blogId: result.blog_id,
				query: searchQuery,
				link: result.link ?? '',
				title: result.title,
			} ).toString();

			event.preventDefault();
			history.push( `/post/?${ search }` );
		},
		[ history, searchQuery ]
	);

	return (
		<div className="inline-help__search">
			<InlineHelpSearchCard searchQuery={ searchQuery } onSearch={ setSearchQuery } isVisible />
			{ searchQuery && (
				<InlineHelpSearchResults
					onSelect={ redirectToArticle }
					searchQuery={ searchQuery }
					openAdminInNewTab
					placeholderLines={ 4 }
				/>
			) }
			{ ! searchQuery && <SibylArticles message="" supportSite={ undefined } /> }
			{ ! searchQuery && <HelpCenterMoreResources /> }
		</div>
	);
};
