/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable no-restricted-imports */
import { useState, useCallback, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useHistory, useLocation } from 'react-router-dom';
import InlineHelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
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

	// Search query can be a query param, if the user searches or clears the search field
	// we need to keep the query param up-to-date with that
	useEffect( () => {
		if ( query ) {
			history.push( '/?query=' + searchQuery );
		}
	}, [ searchQuery, query, history ] );

	const redirectToArticle = useCallback(
		( event, result ) => {
			event.preventDefault();
			const searchResult = {
				...result,
				title: preventWidows( decodeEntities( result.title ) ),
				query: searchQuery,
			};
			const params = new URLSearchParams( {
				link: result.link,
				postId: result.post_id,
				query: searchQuery,
				title: preventWidows( decodeEntities( result.title ) ),
			} );

			if ( result.blog_id ) {
				params.set( 'blogId', result.blog_id );
			}

			history.push( `/post/?${ params }`, searchResult );
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
				placeholder={ __( 'Search for help', __i18n_text_domain__ ) }
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
			{ ! searchQuery && <SibylArticles message="" supportSite={ undefined } navigateToSearch /> }
			{ ! searchQuery && <HelpCenterMoreResources /> }
		</div>
	);
};
