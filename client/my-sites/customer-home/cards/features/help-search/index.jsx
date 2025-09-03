import { Card, Button } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useStillNeedHelpURL } from '@automattic/help-center/src/hooks';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import { RESULT_ARTICLE } from 'calypso/blocks/inline-help/constants';
import HelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import HelpSearchResults from 'calypso/blocks/inline-help/inline-help-search-results';
import CardHeading from 'calypso/components/card-heading';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const HELP_COMPONENT_LOCATION = 'customer-home';
const HELP_CENTER_STORE = HelpCenter.register();

const amendYouTubeLink = ( link = '' ) =>
	link.replace( 'youtube.com/embed/', 'youtube.com/watch?v=' );

const getResultLink = ( result ) => amendYouTubeLink( result.link );

export default function HelpSearch() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ debouncedQuery ] = useDebounce( searchQuery, 500 );

	// trackResultView: Given a result, send an "_open" tracking event indicating that result is opened.
	const trackResultView = ( event, result ) => {
		if ( ! result ) {
			return;
		}

		const resultLink = getResultLink( result );
		const { type = RESULT_ARTICLE, tour } = result;

		const tracksData = Object.fromEntries(
			Object.entries( {
				search_query: debouncedQuery,
				tour,
				result_url: resultLink,
				location: HELP_COMPONENT_LOCATION,
			} ).filter( ( [ , value ] ) => typeof value !== 'undefined' )
		);

		dispatch( recordTracksEvent( `calypso_inlinehelp_${ type }_open`, tracksData ) );
	};
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );
	const { url } = useStillNeedHelpURL();

	const onClick = () => {
		setNavigateToRoute( url );
		setShowHelpCenter( true );
		dispatch( recordTracksEvent( 'calypso_inlinehelp_get_help_click' ) );
	};

	return (
		<>
			<Card className="help-search customer-home__card">
				<div className="help-search__inner">
					<CardHeading tagName="h2">{ translate( 'Need help?' ) }</CardHeading>
					<div className="help-search__content">
						<div className="help-search__search inline-help__search">
							<HelpSearchCard
								onSelect={ trackResultView }
								searchQuery={ debouncedQuery }
								onSearch={ setSearchQuery }
								location={ HELP_COMPONENT_LOCATION }
								placeholder={ translate( 'Search support articles' ) }
							/>
							<HelpSearchResults
								onSelect={ trackResultView }
								searchQuery={ debouncedQuery }
								placeholderLines={ 5 }
								externalLinks
							/>
						</div>
					</div>
				</div>
			</Card>
			<div className="customer-home-help-search__footer">
				<p>
					{ translate(
						'Our AI assistant is here to answer your questions and help you find solutions.'
					) }
				</p>
				<Button variant="secondary" className="help-search__cta" onClick={ onClick }>
					{ translate( 'Get help' ) }
				</Button>
			</div>
		</>
	);
}
