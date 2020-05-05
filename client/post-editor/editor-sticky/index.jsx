/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React, { Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';
import { Button } from '@automattic/components';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';

/**
 * Style dependencies
 */
import './style.scss';

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

		this.props.recordEditorStat( stickyStat );
		this.props.recordEditorEvent( 'Changed Sticky Setting', stickyEventLabel );

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

	stickyPostButtonRef = React.createRef();

	render() {
		const { sticky, translate } = this.props;
		const classes = classnames( 'editor-sticky', { 'is-sticky': sticky } );
		const tooltipLabel = sticky ? (
			<span>{ translate( 'Marked as sticky' ) }</span>
		) : (
			<div>
				{ translate( 'Mark as sticky' ) }
				<span className="editor-sticky__explanation">
					{ translate( 'Stick post to the front page' ) }
				</span>
			</div>
		);

		return (
			<Fragment>
				<Button
					borderless
					className={ classes }
					onClick={ this.toggleStickyStatus }
					onMouseEnter={ this.enableTooltip }
					onMouseLeave={ this.disableTooltip }
					aria-label={ translate( 'Stick post to the front page' ) }
					ref={ this.stickyPostButtonRef }
				>
					<Gridicon icon="bookmark" />
				</Button>
				<Tooltip
					className="editor-sticky__tooltip"
					context={ this.stickyPostButtonRef.current }
					isVisible={ this.state.tooltip }
					position="bottom left"
				>
					{ tooltipLabel }
				</Tooltip>
			</Fragment>
		);
	}
}

export default connect(
	( state ) => {
		const postId = getEditorPostId( state );
		const siteId = getSelectedSiteId( state );
		const sticky = getEditedPostValue( state, siteId, postId, 'sticky' );

		return { postId, siteId, sticky };
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( localize( EditorSticky ) );
