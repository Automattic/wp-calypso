/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flow, get } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';
import Button from 'components/button';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';

class EditorSticky extends Component {

	static propTypes = {
		postId: PropTypes.number,
		siteId: PropTypes.number,
		sticky: PropTypes.bool,
	};

	state = {
		tooltip: false,
	};

	toggleStickyStatus = () => {
		const { stickyStat, stickyEventLabel } = this.props.sticky
			? {
				stickyStat: 'advanced_sticky_disabled_toolbar',
				stickyEventLabel: 'Off',
			}
			: {
				stickyStat: 'advanced_sticky_enabled_toolbar',
				stickyEventLabel: 'On',
			};

		recordStat( stickyStat );
		recordEvent( 'Changed Sticky Setting', stickyEventLabel );

		this.props.editPost( this.props.siteId, this.props.postId, {
			sticky: ! this.props.sticky
		} );
		this.setState( { tooltip: false } );
	}

	enableTooltip = () => {
		this.setState( { tooltip: true } );
	}

	disableTooltip = () => {
		this.setState( { tooltip: false } );
	}

	render() {
		const { translate } = this.props;
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
				aria-label={ translate( 'Stick post to the front page' ) }
				ref="stickyPostButton"
			>
				<Gridicon icon="bookmark" />
				{ this.props.sticky &&
					<Tooltip
						className="editor-sticky__tooltip"
						context={ get( this.refs, 'stickyPostButton' ) }
						isVisible={ this.state.tooltip }
						position="bottom left"
					>
						<span>{ translate( 'Marked as sticky' ) }</span>
					</Tooltip>
				}
			</Button>
		);
	}
}

EditorSticky.displayName = 'EditorSticky';

const enhance = flow(
	localize,
	connect(
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
	)
);

export default enhance( EditorSticky );
