/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React, { useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get, isUndefined, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';
import { hideInlineHelp, showInlineHelp } from 'calypso/state/inline-help/actions';
import { openSupportArticleDialog } from 'calypso/state/inline-support-article/actions';
import HelpSearchCard from 'calypso/blocks/inline-help/inline-help-search-card';
import HelpSearchResults from 'calypso/blocks/inline-help/inline-help-search-results';
import getInlineHelpCurrentlySelectedResult from 'calypso/state/inline-help/selectors/get-inline-help-currently-selected-result';
import {
	RESULT_POST_ID,
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

const HelpSearch = ( { searchQuery, hideInlineHelpUI, showInlineHelpUI, openDialog, track } ) => {
	const translate = useTranslate();

	// When the Customer Home Support is shown we must hide the
	// Inline Help FAB
	// see https://github.com/Automattic/wp-calypso/issues/38860
	useEffect( () => {
		hideInlineHelpUI();

		return () => showInlineHelpUI();
	}, [ hideInlineHelpUI, showInlineHelpUI ] );

	// trackResultView: Given a result, send an "_open" tracking event indicating that result is opened.
	const trackResultView = ( result ) => {
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
			isUndefined
		);
		track( `calypso_inlinehelp_${ type }_open`, tracksData );
	};

	// openResultView: Given a result, open that result, and use trackResultView() to track it.
	const openResultView = ( event, result ) => {
		event.preventDefault();
		if ( ! result ) {
			return;
		}

		trackResultView( result );

		const resultPostId = get( result, RESULT_POST_ID );
		const resultLink = getResultLink( result );
		openDialog( { postId: resultPostId, actionUrl: resultLink } );
	};

	return (
		<>
			<Card className="help-search">
				<div className="help-search__inner">
					<CardHeading>{ translate( 'Get help' ) }</CardHeading>
					<div className="help-search__content">
						<div className="help-search__search inline-help__search">
							<HelpSearchCard
								onSelect={ openResultView }
								query={ searchQuery }
								location={ HELP_COMPONENT_LOCATION }
								placeholder={ translate( 'Search support articles' ) }
							/>
							<HelpSearchResults
								onSelect={ openResultView }
								searchQuery={ searchQuery }
								placeholderLines={ 5 }
							/>
						</div>
					</div>
				</div>
				<div className="help-search__footer">
					<a className="help-search__cta" href="/help">
						<span className="help-search__help-icon">
							<Gridicon icon="help-outline" size={ 24 } />
						</span>
						{ translate( 'More help' ) }
						<Gridicon className="help-search__go-icon" icon="chevron-right" size={ 24 } />
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
	hideInlineHelpUI: hideInlineHelp,
	showInlineHelpUI: showInlineHelp,
	openDialog: openSupportArticleDialog,
	track: recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( HelpSearch );
