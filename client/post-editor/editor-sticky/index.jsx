/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import postActions from 'lib/posts/actions';
import Tooltip from 'components/tooltip';
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { toggleStickyStatus } from 'state/ui/editor/post/actions';

const EditorSticky = React.createClass( {
	propTypes: {
		post: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			tooltip: false
		}
	},

	toggleStickyStatus: function() {
		var stickyStat, stickyEventLabel;

		if ( ! this.props.post.sticky ) {
			stickyStat = 'advanced_sticky_enabled_toolbar';
			stickyEventLabel = 'On';
		} else {
			stickyStat = 'advanced_sticky_disabled_toolbar';
			stickyEventLabel = 'Off';
		}

		recordStat( stickyStat );
		recordEvent( 'Changed Sticky Setting', stickyEventLabel );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		postActions.edit( { sticky: ! this.props.post.sticky } );
		this.setState( { tooltip: false } );
	},

	render: function() {
		const classes = classnames( 'editor-sticky', {
			'is-sticky': this.props.post && this.props.post.sticky
		} );

		return (
			<Button
				borderless
				className={ classes }
				onClick={ this.toggleStickyStatus }
				onMouseEnter={ () => this.setState( { tooltip: true } ) }
				onMouseLeave={ () => this.setState( { tooltip: false } ) }
				aria-label={ this.translate( 'Stick post to the front page' ) }
				ref="stickyPostButton"
			>
				<Gridicon icon="bookmark" />
				<Tooltip
					context={ this.refs && this.refs.stickyPostButton }
					isVisible={ this.state.tooltip }
					position="bottom"
				>
					{ this.props.post && this.props.post.sticky
						? <span>{ this.translate( 'Marked as sticky' ) }</span>
						: <div>
							{ this.translate( 'Mark post as sticky' ) }
							<span className="editor-sticky__explanation">
								{ this.translate( 'Displayed at the top' ) }
							</span>
						</div>
					}
				</Tooltip>
			</Button>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( {
		toggleStickyStatus
	}, dispatch ),
	null,
	{ pure: false }
)( EditorSticky );
