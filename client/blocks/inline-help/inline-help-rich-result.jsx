/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, getLocaleSlug } from 'i18n-calypso';
import classNames from 'classnames';
import { get, isUndefined, omitBy } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import {
	RESULT_ARTICLE,
	RESULT_DESCRIPTION,
	RESULT_LINK,
	RESULT_TITLE,
	RESULT_TOUR,
	RESULT_TYPE,
	RESULT_VIDEO,
} from './constants';
import { Button } from '@automattic/components';
import { decodeEntities, preventWidows } from 'lib/formatting';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSearchQuery } from 'state/inline-help/selectors';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { openSupportArticleDialog } from 'state/inline-support-article/actions';

const amendYouTubeLink = ( link = '' ) =>
	link.replace( 'youtube.com/embed/', 'youtube.com/watch?v=' );

class InlineHelpRichResult extends Component {
	static propTypes = {
		setDialogState: PropTypes.func.isRequired,
		closePopover: PropTypes.func.isRequired,
		searchQuery: PropTypes.string,
		result: PropTypes.object,
		type: PropTypes.string,
		postId: PropTypes.number,
		title: PropTypes.string,
		description: PropTypes.string,
		tour: PropTypes.string,
	};

	buttonLabels = {
		article: this.props.translate( 'Read more' ),
		video: this.props.translate( 'Watch a video' ),
		tour: this.props.translate( 'Start Tour' ),
	};

	buttonIcons = {
		tour: 'list-ordered',
		video: 'video',
		article: 'reader',
	};

	state = {
		showDialog: false,
	};

	handleClick = ( event ) => {
		const isLocaleEnglish = 'en' === getLocaleSlug();
		const { type, tour, link, searchQuery, postId } = this.props;

		const tracksData = omitBy(
			{
				search_query: searchQuery,
				tour,
				result_url: link,
			},
			isUndefined
		);

		this.props.recordTracksEvent( `calypso_inlinehelp_${ type }_open`, tracksData );
		this.props.closePopover();

		if ( type === RESULT_TOUR ) {
			event.preventDefault();
			this.props.requestGuidedTour( tour );
		} else if ( type === RESULT_VIDEO ) {
			event.preventDefault();
			this.props.setDialogState( {
				showDialog: true,
				dialogType: 'video',
				videoLink: link,
			} );
		} else if ( type === RESULT_ARTICLE && postId && isLocaleEnglish ) {
			// Until we can deliver localized inline support article content, we send the
			// the user to the localized support blog, if one exists.
			event.preventDefault();
			this.props.openSupportArticleDialog( { postId, postUrl: link } );
		} // else falls back on href
	};

	render() {
		const { type, title, description, link } = this.props;
		const buttonLabel = get( this.buttonLabels, type, '' );
		const buttonIcon = get( this.buttonIcons, type );
		const classes = classNames( 'inline-help__richresult__title' );

		return (
			<div>
				<h2 className={ classes }>{ preventWidows( decodeEntities( title ) ) }</h2>
				<p>{ preventWidows( decodeEntities( description ) ) }</p>
				<Button primary onClick={ this.handleClick } href={ link }>
					{ buttonIcon && <Gridicon icon={ buttonIcon } size={ 12 } /> }
					{ buttonIcon && buttonLabel && ' ' }
					{ buttonLabel }
				</Button>
			</div>
		);
	}
}

const mapStateToProps = ( state, { result } ) => ( {
	searchQuery: getSearchQuery( state ),
	type: get( result, RESULT_TYPE, RESULT_ARTICLE ),
	title: get( result, RESULT_TITLE ),
	link: amendYouTubeLink( get( result, RESULT_LINK ) ),
	description: get( result, RESULT_DESCRIPTION ),
	tour: get( result, RESULT_TOUR ),
	postId: get( result, 'post_id' ),
} );

const mapDispatchToProps = {
	recordTracksEvent,
	requestGuidedTour,
	openSupportArticleDialog,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpRichResult ) );
