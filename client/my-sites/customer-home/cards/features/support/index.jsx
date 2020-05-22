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

import { composeAnalytics, recordTracksEvent, bumpStat } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import { getSearchQuery, getInlineHelpCurrentlySelectedResult } from 'state/inline-help/selectors';
import { hideInlineHelp, showInlineHelp } from 'state/inline-help/actions';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';
import QuerySupportTypes from '../../../../../blocks/inline-help/inline-help-query-support-types';
import SupportSearchCard from './search-card';
import SupportSearchResults from './search-results';

import {
	RESULT_ARTICLE,
	RESULT_DESCRIPTION,
	RESULT_LINK,
	RESULT_TITLE,
	RESULT_TOUR,
	RESULT_TYPE,
} from '../../../../../blocks/inline-help/constants';

/**
 * Style dependencies
 */
import './style.scss';

const amendYouTubeLink = ( link = '' ) =>
	link.replace( 'youtube.com/embed/', 'youtube.com/watch?v=' );

const Support = ( props ) => {
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

		const { post_id, link } = selectedResult;

		props.openSupportArticleDialog( {
			postId: post_id,
			actionUrl: link,
		} );
	};

	return (
		<>
			<QuerySupportTypes />
			<Card className="support">
				<div className="support__inner">
					<CardHeading>{ translate( 'Get help' ) }</CardHeading>
					<div className="support__content">
						<div className="support__search">
							<SupportSearchCard openResult={ openResultView } query={ searchQuery } />
							<SupportSearchResults openResult={ openResultView } searchQuery={ searchQuery } />
						</div>
					</div>
				</div>
				<div className="support__footer">
					<a className="support__cta" href="/help">
						<span className="support__help-icon">
							<Gridicon icon="help-outline" size={ 24 } />
						</span>
						More Help
						<Gridicon className="support__go-icon" icon="chevron-right" size={ 24 } />
					</a>
				</div>
			</Card>
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const isStaticHomePage =
		! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' );

	const result = getInlineHelpCurrentlySelectedResult( state );

	return {
		isStaticHomePage,
		searchQuery: getSearchQuery( state ),
		type: get( result, RESULT_TYPE, RESULT_ARTICLE ),
		title: get( result, RESULT_TITLE ),
		link: amendYouTubeLink( get( result, RESULT_LINK ) ),
		description: get( result, RESULT_DESCRIPTION ),
		tour: get( result, RESULT_TOUR ),
		postId: get( result, 'post_id' ),
	};
};

const trackDocsAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_support_docs_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'support_docs' )
	);

const trackContactAction = ( isStaticHomePage ) =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_support_contact_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'support_contact' )
	);

const mapDispatchToProps = {
	trackContactAction,
	trackDocsAction,
	hideInlineHelpUI: hideInlineHelp,
	showInlineHelpUI: showInlineHelp,
	openSupportArticleDialog,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		trackContactAction: () => dispatchProps.trackContactAction( isStaticHomePage ),
		trackDocsAction: () => dispatchProps.trackDocsAction( isStaticHomePage ),
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( Support );
