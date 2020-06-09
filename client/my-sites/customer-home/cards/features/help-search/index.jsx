/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React, { useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import Gridicon from 'components/gridicon';

import { getSearchQuery } from 'state/inline-help/selectors';
import { hideInlineHelp, showInlineHelp } from 'state/inline-help/actions';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';
import HelpSearchCard from './search-card';
import HelpSearchResults from './search-results';

import { RESULT_POST_ID, RESULT_LINK } from 'blocks/inline-help/constants';

/**
 * Style dependencies
 */
import './style.scss';

const amendYouTubeLink = ( link = '' ) =>
	link.replace( 'youtube.com/embed/', 'youtube.com/watch?v=' );

const HelpSearch = ( props ) => {
	const translate = useTranslate();
	const { searchQuery, hideInlineHelpUI, showInlineHelpUI } = props;

	// When the Customer Home Support is shown we must hide the
	// Inline Help FAB
	// see https://github.com/Automattic/wp-calypso/issues/38860
	useEffect( () => {
		hideInlineHelpUI();

		return () => showInlineHelpUI();
	}, [ hideInlineHelpUI, showInlineHelpUI ] );

	const openResultView = ( event, selectedResult ) => {
		event.preventDefault();

		// Edge case if no search result is selected
		if ( ! selectedResult ) {
			return;
		}

		// Grab properties using constants for safety
		const resultPostId = get( selectedResult, RESULT_POST_ID );
		const resultLink = amendYouTubeLink( get( selectedResult, RESULT_LINK ) );

		props.openSupportArticleDialog( {
			postId: resultPostId,
			actionUrl: resultLink,
		} );
	};

	return (
		<>
			<Card className="help-search">
				<div className="help-search__inner">
					<CardHeading>{ translate( 'Get help' ) }</CardHeading>
					<div className="help-search__content">
						<div className="help-search__search">
							<HelpSearchCard openResult={ openResultView } query={ searchQuery } />
							<HelpSearchResults openResult={ openResultView } searchQuery={ searchQuery } />
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

const mapStateToProps = ( state ) => {
	return {
		searchQuery: getSearchQuery( state ),
	};
};

const mapDispatchToProps = {
	hideInlineHelpUI: hideInlineHelp,
	showInlineHelpUI: showInlineHelp,
	openSupportArticleDialog,
};

export default connect( mapStateToProps, mapDispatchToProps )( HelpSearch );
