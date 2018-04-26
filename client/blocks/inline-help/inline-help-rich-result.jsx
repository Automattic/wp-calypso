/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { omitBy, isUndefined } from 'lodash';

/**
 * Internal Dependencies
 */

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
		type: this.props.result.type || 'article',
		showDialog: false,
	};

	handleClick = event => {
		event.preventDefault();
		const { href } = event.target;
		const { type } = this.state;
		const { tour } = this.props.result;
		const tracksData = omitBy(
			{
				search_query: this.props.searchQuery,
				tour,
				result_url: href,
			},
			isUndefined
		);

		this.props.recordTracksEvent( `calypso_inlinehelp_${ type }_open`, tracksData );

		if ( type === 'tour' ) {
			this.props.requestGuidedTour( tour );
		} else if ( type === 'video' ) {
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
		const { link } = this.props.result;
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
		const { type } = this.state;
		const { translate, result } = this.props;
		const { title, description, link } = result;
		const classes = classNames( 'inline-help__richresult__title' );
		return (
			<div>
				<h2 className={ classes }>{ preventWidows( decodeEntities( title ) ) }</h2>
				<p> { decodeEntities( description ) } </p>
				<Button primary onClick={ this.handleClick } href={ link }>
					{
						{
							article: translate( 'Read more' ),
							video: translate( 'Watch a video' ),
							tour: translate( 'Start tour' ),
						}[ type ]
					}
				</Button>
				{ type === 'video' && this.renderDialog() }
			</div>
		);
	}
}

export default connect(
	state => ( {
		searchQuery: getSearchQuery( state ),
	} ),
	{
		recordTracksEvent,
		requestGuidedTour,
	}
)( localize( InlineHelpRichResult ) );
