/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import postActions from 'lib/posts/actions';
import Tooltip from 'components/tooltip';
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import { recordStat, recordEvent } from 'lib/posts/stats';

export default React.createClass( {
	displayName: 'EditorSticky',

	propTypes: {
		post: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			tooltip: false
		};
	},

	toggleStickyStatus: function() {
		let stickyStat;
		let stickyEventLabel;

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
					position="bottom left"
				>
					{ this.props.post && this.props.post.sticky
						? <span>{ this.translate( 'Marked as sticky' ) }</span>
						: <div>
							{ this.translate( 'Mark as sticky' ) }
							<span className="editor-sticky__explanation">
								{ this.translate( 'Displayed at top' ) }
							</span>
						</div>
					}
				</Tooltip>
			</Button>
		);
	}
} );
