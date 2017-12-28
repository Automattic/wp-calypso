/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Tooltip from 'client/components/tooltip';
import Button from 'client/components/button';
import { recordStat, recordEvent } from 'client/lib/posts/stats';
import { editPost } from 'client/state/posts/actions';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { getEditedPostValue } from 'client/state/posts/selectors';

class EditorSticky extends React.Component {
	static displayName = 'EditorSticky';

	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		sticky: PropTypes.bool,
	};

	state = {
		tooltip: false,
	};

	toggleStickyStatus = () => {
		let stickyStat;
		let stickyEventLabel;

		if ( ! this.props.sticky ) {
			stickyStat = 'advanced_sticky_enabled_toolbar';
			stickyEventLabel = 'On';
		} else {
			stickyStat = 'advanced_sticky_disabled_toolbar';
			stickyEventLabel = 'Off';
		}

		recordStat( stickyStat );
		recordEvent( 'Changed Sticky Setting', stickyEventLabel );

		this.props.editPost( this.props.siteId, this.props.postId, {
			sticky: ! this.props.sticky,
		} );
		this.setState( { tooltip: false } );
	};

	enableTooltip = () => {
		this.setState( { tooltip: true } );
	};

	disableTooltip = () => {
		this.setState( { tooltip: false } );
	};

	render() {
		const classes = classnames( 'editor-sticky', { 'is-sticky': this.props.sticky } );

		return (
			<Button
				borderless
				className={ classes }
				onClick={ this.toggleStickyStatus }
				onMouseEnter={ this.enableTooltip }
				onMouseLeave={ this.disableTooltip }
				aria-label={ this.props.translate( 'Stick post to the front page' ) }
				ref="stickyPostButton"
			>
				<Gridicon icon="bookmark" />
				{ this.props.sticky && (
					<Tooltip
						className="editor-sticky__tooltip"
						context={ this.refs && this.refs.stickyPostButton }
						isVisible={ this.state.tooltip }
						position="bottom left"
					>
						<span>{ this.props.translate( 'Marked as sticky' ) }</span>
					</Tooltip>
				) }
			</Button>
		);
	}
}

export default connect(
	state => {
		const postId = getEditorPostId( state );
		const siteId = getSelectedSiteId( state );
		const sticky = getEditedPostValue( state, siteId, postId, 'sticky' );

		return {
			postId,
			siteId,
			sticky,
		};
	},
	{ editPost }
)( localize( EditorSticky ) );
