import { Card, Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useStillNeedHelpURL } from '@automattic/help-center/src/hooks';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
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

	// trackResultView: Given a result, send an "_open" tracking event indicating that result is opened.
	const trackResultView = ( event, result ) => {
		if ( ! result ) {
			return;
		}

		const resultLink = getResultLink( result );
		const { type = RESULT_ARTICLE, tour } = result;

		const tracksData = Object.fromEntries(
			Object.entries( {
				search_query: searchQuery,
				tour,
				result_url: resultLink,
				location: HELP_COMPONENT_LOCATION,
			} ).filter( ( [ , value ] ) => typeof value !== 'undefined' )
		);

		dispatch( recordTracksEvent( `calypso_inlinehelp_${ type }_open`, tracksData ) );
	};
	const { setShowHelpCenter, setInitialRoute } = useDataStoreDispatch( HELP_CENTER_STORE );
	const { url } = useStillNeedHelpURL();

	const onClick = () => {
		setInitialRoute( url );
		setShowHelpCenter( true );
		dispatch( recordTracksEvent( 'calypso_inlinehelp_get_help_click' ) );
	};

	return (
		<>
			<Card className="help-search customer-home__card">
				<div className="help-search__inner">
					<CardHeading tagName="h2">{ translate( 'Get help' ) }</CardHeading>
					<div className="help-search__content">
						<div className="help-search__search inline-help__search">
							<HelpSearchCard
								onSelect={ trackResultView }
								searchQuery={ searchQuery }
								onSearch={ setSearchQuery }
								location={ HELP_COMPONENT_LOCATION }
								placeholder={ translate( 'Search support articles' ) }
							/>
							<HelpSearchResults
								onSelect={ trackResultView }
								searchQuery={ searchQuery }
								placeholderLines={ 5 }
								externalLinks
							/>
						</div>
					</div>
				</div>
				<div className="help-search__footer">
					<Button className="help-search__cta" onClick={ onClick }>
						<span className="help-search__help-icon">
							<Gridicon icon="help" size={ 36 } />
						</span>
						{ translate( 'Get help' ) }
					</Button>
				</div>
			</Card>
		</>
	);
}
