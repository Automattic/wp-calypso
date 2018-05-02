/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get, isUndefined, omitBy } from 'lodash';

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
import Button from 'components/button';
import Dialog from 'components/dialog';
import ResizableIframe from 'components/resizable-iframe';
import { decodeEntities, preventWidows } from 'lib/formatting';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSearchQuery } from 'state/inline-help/selectors';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

class InlineHelpRichResult extends Component {
	static propTypes = {
		result: PropTypes.object,
	};

	state = {
		showDialog: false,
	};

	handleClick = event => {
		event.preventDefault();
		const { href } = event.target;
		const { type } = this.props;
		const tour = get( this.props.result, RESULT_TOUR );
		const tracksData = omitBy(
			{
				search_query: this.props.searchQuery,
				tour,
				result_url: href,
			},
			isUndefined
		);

		this.props.recordTracksEvent( `calypso_inlinehelp_${ type }_open`, tracksData );

		if ( type === RESULT_TOUR ) {
			this.props.requestGuidedTour( tour );
		} else if ( type === RESULT_VIDEO ) {
			if ( event.metaKey ) {
				window.open( href, '_blank' );
			} else {
				this.setState( { showDialog: ! this.state.showDialog } );
			}
		} else {
			if ( ! href ) {
				return;
			}
			if ( event.metaKey ) {
				window.open( href, '_blank' );
			} else {
				window.location = href;
			}
		}
	};

	onCancel = () => {
		this.setState( { showDialog: ! this.state.showDialog } );
	};

	renderDialog = () => {
		const { showDialog } = this.state;
		const link = get( this.props.result, RESULT_LINK );
		const iframeClasses = classNames( 'inline-help__richresult__dialog__video' );
		return (
			<Dialog
				additionalClassNames="inline-help__richresult__dialog"
				isVisible={ showDialog }
				onCancel={ this.onCancel }
				onClose={ this.onCancel }
			>
				<div className={ iframeClasses }>
					<ResizableIframe
						src={ link + '?rel=0&amp;showinfo=0&amp;autoplay=1' }
						frameBorder="0"
						seamless
						allowFullScreen
						autoPlay
						width="640"
						height="360"
					/>
				</div>
			</Dialog>
		);
	};

	render() {
		const { type } = this.props;
		const { translate, result } = this.props;
		const title = get( result, RESULT_TITLE );
		const description = get( result, RESULT_DESCRIPTION );
		const link = get( result, RESULT_LINK );
		const classes = classNames( 'inline-help__richresult__title' );
		return (
			<div>
				<h2 className={ classes }>{ preventWidows( decodeEntities( title ) ) }</h2>
				<p>{ preventWidows( decodeEntities( description ) ) }</p>
				<Button primary onClick={ this.handleClick } href={ link }>
					{
						{
							article: translate( 'Read more' ),
							video: translate( 'Watch a video' ),
							tour: translate( 'Start Tour' ),
						}[ type ]
					}
				</Button>
				{ type === RESULT_VIDEO && this.renderDialog() }
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	searchQuery: getSearchQuery( state ),
	type: get( ownProps.result, RESULT_TYPE, RESULT_ARTICLE ),
} );
const mapDispatchToProps = {
	recordTracksEvent,
	requestGuidedTour,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( InlineHelpRichResult ) );
