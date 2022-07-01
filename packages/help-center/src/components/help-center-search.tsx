/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable no-restricted-imports */
import { useState, useCallback } from '@wordpress/element';
import { useHistory, useLocation } from 'react-router-dom';
import InlineHelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { HelpCenterMoreResources } from './help-center-more-resources';
import HelpCenterSearchResults from './help-center-search-results';
import './help-center-search.scss';
import { SibylArticles } from './help-center-sibyl-articles';

export const HelpCenterSearch = () => {
	const history = useHistory();
	const { search } = useLocation();
	const params = new URLSearchParams( search );
	const query = params.get( 'query' );

	const [ searchQuery, setSearchQuery ] = useState( query || '' );

	const redirectToArticle = useCallback(
		( event, result ) => {
			const search = new URLSearchParams( {
				postId: result.post_id,
				query: searchQuery,
				link: result.link ?? '',
				title: result.title,
			} );

			if ( result.blog_id ) {
				search.append( 'blogId', result.blog_id );
			}

			event.preventDefault();
			history.push( `/post/?${ search.toString() }` );
		},
		[ history, searchQuery ]
	);

	return (
		<div className="inline-help__search">
			<InlineHelpSearchCard
				searchQuery={ searchQuery }
				onSearch={ setSearchQuery }
				location="help-center"
				isVisible
			/>
			{ searchQuery && (
				<HelpCenterSearchResults
					onSelect={ redirectToArticle }
					searchQuery={ searchQuery }
					openAdminInNewTab
					placeholderLines={ 4 }
					location="help-center"
				/>
			) }
			{ ! searchQuery && <SibylArticles message="" supportSite={ undefined } /> }
			{ ! searchQuery && <HelpCenterMoreResources /> }
		</div>
	);
};
