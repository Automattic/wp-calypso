/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';
import HelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import HelpSearchResults from 'calypso/blocks/inline-help/inline-help-search-results';
import getInlineHelpCurrentlySelectedResult from 'calypso/state/inline-help/selectors/get-inline-help-currently-selected-result';
import {
	RESULT_ARTICLE,
	RESULT_LINK,
	RESULT_TOUR,
	RESULT_TYPE,
} from 'calypso/blocks/inline-help/constants';

/**
 * Style dependencies
 */
import './style.scss';

const HELP_COMPONENT_LOCATION = 'customer-home';

const amendYouTubeLink = ( link = '' ) =>
	link.replace( 'youtube.com/embed/', 'youtube.com/watch?v=' );

const getResultLink = ( result ) => amendYouTubeLink( get( result, RESULT_LINK ) );

const HelpSearch = ( { searchQuery, track } ) => {
	const translate = useTranslate();

	// trackResultView: Given a result, send an "_open" tracking event indicating that result is opened.
	const trackResultView = ( event, result ) => {
		if ( ! result ) {
			return;
		}

		const resultLink = getResultLink( result );
		const type = get( result, RESULT_TYPE, RESULT_ARTICLE );
		const tour = get( result, RESULT_TOUR );

		const tracksData = omitBy(
			{
				search_query: searchQuery,
				tour,
				result_url: resultLink,
				location: HELP_COMPONENT_LOCATION,
			},
			( prop ) => typeof prop === 'undefined'
		);
		track( `calypso_inlinehelp_${ type }_open`, tracksData );
	};

	return (
		<>
			<Card className="help-search customer-home__card">
				<div className="help-search__inner">
					<CardHeading>{ translate( 'Get help' ) }</CardHeading>
					<div className="help-search__content">
						<div className="help-search__search inline-help__search">
							<HelpSearchCard
								onSelect={ trackResultView }
								query={ searchQuery }
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
					<a className="help-search__cta" href="/help/contact">
						<span className="help-search__help-icon">
							<Gridicon icon="help" size={ 36 } />
						</span>
						{ translate( 'Contact support' ) }
					</a>
				</div>
			</Card>
		</>
	);
};

const mapStateToProps = ( state ) => ( {
	searchQuery: getSearchQuery( state ),
	selectedResult: getInlineHelpCurrentlySelectedResult( state ),
} );

const mapDispatchToProps = {
	track: recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( HelpSearch );
