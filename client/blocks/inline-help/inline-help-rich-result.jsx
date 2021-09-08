import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize, getLocaleSlug } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestGuidedTour } from 'calypso/state/guided-tours/actions';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';
import { openSupportArticleDialog } from 'calypso/state/inline-support-article/actions';
import { RESULT_ARTICLE, RESULT_TOUR, RESULT_VIDEO } from './constants';

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

	handleClick = ( event ) => {
		const isLocaleEnglish = 'en' === getLocaleSlug();
		const { type, tour, link, searchQuery, postId } = this.props;

		const tracksData = {
			search_query: searchQuery,
			location: 'inline-help-popover',
			result_url: link,
			tour,
		};

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
		const buttonLabel = this.buttonLabels[ type ] ?? '';
		const buttonIcon = this.buttonIcons[ type ];
		const classes = classNames( 'inline-help__richresult__title' );

		return (
			<div>
				<h2 className={ classes } tabIndex="-1">
					{ preventWidows( decodeEntities( title ) ) }
				</h2>
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

const mapStateToProps = ( state ) => ( {
	searchQuery: getSearchQuery( state ),
} );

const mapDispatchToProps = {
	recordTracksEvent,
	requestGuidedTour,
	openSupportArticleDialog,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpRichResult ) );
