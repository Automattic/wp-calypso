/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Tooltip from 'components/tooltip';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { editPost } from 'state/posts/actions';
import { getEditedPostValue } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const EditorSticky = React.createClass( {
	displayName: 'EditorSticky',

	propTypes: {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		sticky: PropTypes.bool
	},

	getInitialState: function() {
		return {
			tooltip: false
		};
	},

	toggleStickyStatus: function() {
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
			sticky: ! this.props.sticky
		} );
		this.setState( { tooltip: false } );
	},

	enableTooltip: function() {
		this.setState( { tooltip: true } );
	},

	disableTooltip: function() {
		this.setState( { tooltip: false } );
	},

	render: function() {
		const classes = classnames(
			'editor-sticky',
			{ 'is-sticky': this.props.sticky }
		);

		return (
			<Button
				borderless
				className={ classes }
				onClick={ this.toggleStickyStatus }
				onMouseEnter={ this.enableTooltip }
				onMouseLeave={ this.disableTooltip }
				aria-label={ this.translate( 'Stick post to the front page' ) }
				ref="stickyPostButton"
			>
				<Gridicon icon="bookmark" />
				{ this.props.sticky &&
					<Tooltip
						className="editor-sticky__tooltip"
						context={ this.refs && this.refs.stickyPostButton }
						isVisible={ this.state.tooltip }
						position="bottom left"
					>
						<span>{ this.translate( 'Marked as sticky' ) }</span>
					</Tooltip>
				}
			</Button>
		);
	}
} );

export default connect(
	( state ) => {
		const postId = getEditorPostId( state );
		const siteId = getSelectedSiteId( state );
		const sticky = getEditedPostValue( state, siteId, postId, 'sticky' );

		return {
			postId,
			siteId,
			sticky
		};
	},
	{ editPost }
)( EditorSticky );
