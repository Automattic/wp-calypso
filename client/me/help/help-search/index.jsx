import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import SearchCard from 'calypso/components/search-card';
import { useHelpSearchQuery } from 'calypso/data/help/use-help-search-query';
import { localizeUrl } from 'calypso/lib/i18n-utils/localize-url';
import HelpResults from 'calypso/me/help/help-results';
import NoResults from 'calypso/my-sites/no-results';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import './style.scss';

export default function HelpSearch( props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ searchQuery, setQuery ] = useState( '' );
	const { data: helpLinks } = useHelpSearchQuery( searchQuery );

	const onSearch = ( query ) => {
		setQuery( query );
		props.onSearch( !! query );
		dispatch( recordTracksEvent( 'calypso_help_search', { query } ) );
	};

	function renderSearchResults() {
		if ( ! searchQuery ) {
			return null;
		}

		if ( ! helpLinks ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<div className="help-results__placeholder">
					<HelpResults
						header="..."
						helpLinks={ [
							{
								title: '',
								description: '',
								link: '#',
								disabled: true,
							},
						] }
						footer="..."
						iconTypeDescription=""
						searchLink="#"
					/>
				</div>
			);
		}

		if (
			! helpLinks.wordpress_support_links?.length &&
			! helpLinks.wordpress_forum_links?.length &&
			! helpLinks.wordpress_forum_links_localized?.length &&
			! helpLinks.jetpack_support_links?.length
		) {
			return (
				<CompactCard className="help-search__no-results">
					<NoResults
						text={ translate( 'No results found for {{em}}%(searchQuery)s{{/em}}', {
							args: { searchQuery },
							components: { em: <em /> },
						} ) }
					/>
				</CompactCard>
			);
		}

		const forumBaseUrl = helpLinks.wordpress_forum_links_localized
			? localizeUrl( 'https://wordpress.com/forums' )
			: 'https://wordpress.com/forums';

		return (
			<div>
				<HelpResults
					footer={ translate( 'See more from WordPress.com Documentation…' ) }
					header={ translate( 'WordPress.com Documentation' ) }
					helpLinks={ helpLinks.wordpress_support_links }
					iconTypeDescription="book"
					searchLink={ 'https://wordpress.com/support?s=' + searchQuery }
				/>
				<HelpResults
					footer={ translate( 'See more from Community Forum…' ) }
					header={ translate( 'Community Answers' ) }
					helpLinks={ helpLinks.wordpress_forum_links_localized || helpLinks.wordpress_forum_links }
					iconTypeDescription="comment"
					searchLink={ `${ forumBaseUrl }?s=${ searchQuery }` }
				/>
				<HelpResults
					footer={ translate( 'See more from Jetpack Documentation…' ) }
					header={ translate( 'Jetpack Documentation' ) }
					helpLinks={ helpLinks.jetpack_support_links }
					iconTypeDescription="jetpack"
					searchLink="https://jetpack.me/support/"
				/>
			</div>
		);
	}

	return (
		<div className="help-search">
			<SearchCard
				analyticsGroup="Help"
				delaySearch
				initialValue=""
				onSearch={ onSearch }
				placeholder={ translate( 'How can we help?' ) }
			/>
			{ renderSearchResults() }
		</div>
	);
}
