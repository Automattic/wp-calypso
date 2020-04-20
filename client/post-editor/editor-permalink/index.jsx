/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { pick } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import Slug from 'post-editor/editor-slug';
import Popover from 'components/popover';
import Tooltip from 'components/tooltip';
import ClipboardButton from 'components/forms/clipboard-button';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostSlug } from 'state/posts/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class EditorPermalink extends Component {
	static propTypes = {
		path: PropTypes.string,
		isEditable: PropTypes.bool,
		translate: PropTypes.func,
		slug: PropTypes.string,
	};

	permalinkToggleReference = React.createRef();

	constructor() {
		super( ...arguments );
		this.showPopover = this.showPopover.bind( this );
		this.showTooltip = this.showTooltip.bind( this );
		this.onCopy = this.onCopy.bind( this );
		this.hideTooltip = this.hideTooltip.bind( this );
		this.closePopover = this.closePopover.bind( this );

		this.state = {
			showPopover: false,
			showCopyConfirmation: false,
			tooltip: false,
		};
	}

	componentWillUnmount() {
		clearTimeout( this.dismissCopyConfirmation );
	}

	showPopover() {
		this.setState( {
			showPopover: ! this.state.showPopover,
			tooltip: false,
		} );
	}

	showTooltip() {
		if ( ! this.state.showPopover ) {
			this.setState( { tooltip: true } );
		}
	}

	onCopy() {
		this.setState( {
			showCopyConfirmation: true,
		} );

		clearTimeout( this.dismissCopyConfirmation );
		this.dismissCopyConfirmation = setTimeout( () => {
			this.setState( {
				showCopyConfirmation: false,
			} );
		}, 4000 );
	}

	hideTooltip() {
		this.setState( { tooltip: false } );
	}

	closePopover() {
		this.setState( { showPopover: false } );
	}

	renderCopyButton() {
		const { path, slug, translate } = this.props;

		let label;
		if ( this.state.showCopyConfirmation ) {
			label = translate( 'Copied!' );
		} else {
			label = translate( 'Copy', { context: 'verb' } );
		}

		return (
			<ClipboardButton text={ path + slug } onCopy={ this.onCopy } compact>
				{ label }
			</ClipboardButton>
		);
	}

	render() {
		const { translate } = this.props;
		let tooltipMessage;

		if ( this.props.isEditable ) {
			tooltipMessage = translate( 'Edit post URL' );
		} else {
			tooltipMessage = translate( 'View post URL' );
		}

		return (
			<Fragment>
				<div
					className="editor-permalink"
					onMouseEnter={ this.showTooltip }
					onMouseLeave={ this.hideTooltip }
				>
					<Gridicon
						className="editor-permalink__toggle"
						icon="link"
						onClick={ this.showPopover }
						ref={ this.permalinkToggleReference }
					/>
				</div>
				<Popover
					isVisible={ this.state.showPopover }
					onClose={ this.closePopover }
					position={ 'bottom right' }
					context={ this.permalinkToggleReference.current }
					className="editor-permalink__popover"
				>
					<Slug
						{ ...pick( this.props, 'path', 'isEditable' ) }
						onEscEnter={ this.closePopover }
						instanceName="post-popover"
					/>
					{ this.renderCopyButton() }
				</Popover>
				<Tooltip
					context={ this.permalinkToggleReference.current }
					isVisible={ this.state.tooltip }
					position="bottom"
				>
					{ tooltipMessage }
				</Tooltip>
			</Fragment>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );

	return {
		slug: getEditedPostSlug( state, siteId, postId ),
	};
} )( localize( EditorPermalink ) );
