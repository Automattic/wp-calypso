import { Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize, getLocaleSlug } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestGuidedTour } from 'calypso/state/guided-tours/actions';
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

	getButtonLabel = ( type = RESULT_ARTICLE ) => {
		const { translate } = this.props;

		const labels = {
			[ RESULT_ARTICLE ]: translate( 'Read more' ),
			[ RESULT_VIDEO ]: translate( 'Watch a video' ),
			[ RESULT_TOUR ]: translate( 'Start Tour' ),
		};

		return labels[ type ];
	};

	buttonIcons = {
		[ RESULT_TOUR ]: 'list-ordered',
		[ RESULT_VIDEO ]: 'video',
		[ RESULT_ARTICLE ]: 'reader',
	};

	handleClick = ( event ) => {
		const isLocaleEnglish = 'en' === getLocaleSlug();
		const { searchQuery, result } = this.props;
		const { type = RESULT_ARTICLE, tour, link, post_id: postId } = result;

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
			return;
		}

		if ( type === RESULT_VIDEO ) {
			event.preventDefault();
			this.props.setDialogState( {
				showDialog: true,
				dialogType: 'video',
				videoLink: link,
			} );
			return;
		}

		if ( postId && isLocaleEnglish ) {
			// Until we can deliver localized inline support article content, we send the
			// the user to the localized support blog, if one exists.
			event.preventDefault();
			this.props.openSupportArticleDialog( { postId, postUrl: link } );
		}
		// falls back on href
	};

	render() {
		const { type, title, description, link } = this.props.result;
		const buttonLabel = this.getButtonLabel( type );
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

const mapDispatchToProps = {
	recordTracksEvent,
	requestGuidedTour,
	openSupportArticleDialog,
};

export default connect( null, mapDispatchToProps )( localize( InlineHelpRichResult ) );
