/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { composeAnalytics, recordTracksEvent, bumpStat } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import InlineHelpSearchResults from '../../../../../blocks/inline-help/inline-help-search-results';
import InlineHelpSearchCard from '../../../../../blocks/inline-help/inline-help-search-card';
import QuerySupportTypes from '../../../../../blocks/inline-help/inline-help-query-support-types';
import { getSearchQuery, getInlineHelpCurrentlySelectedResult } from 'state/inline-help/selectors';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';

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

/**
 * Image dependencies
 */
import happinessIllustration from 'assets/images/customer-home/happiness.png';

const amendYouTubeLink = ( link = '' ) =>
	link.replace( 'youtube.com/embed/', 'youtube.com/watch?v=' );

const Support = ( props ) => {
	const translate = useTranslate();
	const { searchQuery } = props;

	const openResultView = ( event, selectedResult ) => {
		const { post_id, link } = selectedResult;

		event.preventDefault();
		props.openSupportArticleDialog( { postId: post_id, actionUrl: link } );
	};

	return (
		<Card className="support">
			<CardHeading>{ translate( 'Support' ) }</CardHeading>
			<h6 className="support__header customer-home__card-subheader">
				{ translate( 'Get all the help you need.' ) }
			</h6>
			<div className="support__content">
				<img src={ happinessIllustration } alt={ translate( 'Support' ) } />
				<QuerySupportTypes />
				<div className="support__search">
					<InlineHelpSearchCard openResult={ openResultView } query={ searchQuery } />
					<InlineHelpSearchResults openResult={ openResultView } searchQuery={ searchQuery } />
				</div>
			</div>
		</Card>
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
