/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import Button from 'components/button';

class EditorConfirmationSidebar extends React.Component {
	static propTypes = {
		hideSidebar: React.PropTypes.func,
		isActive: React.PropTypes.bool,
		isPublishing: React.PropTypes.bool,
		onPublish: React.PropTypes.func,
	};

	closeAndPublish = () => {
		this.props.onPublish( true );
		this.props.hideSidebar();
	};

	render() {
		const showOverlay = this.props.isActive || this.props.isPublishing;

		return (
			<RootChild>
				<div className={ classnames( {
						'editor-confirmation-sidebar': true,
						'is-active': showOverlay,
				} ) } >
					<div className={ classnames( {
						'editor-confirmation-sidebar__publishing-indicator': true,
						'is-active': this.props.isPublishing,
					} ) } ><Gridicon size={ 36 } icon="ellipsis" /> Publishing...</div>
					<div className={ classnames( {
						'editor-confirmation-sidebar__overlay': true,
						'is-active': showOverlay,
					} ) } onClick={ this.props.hideSidebar }></div>
					<div className={ classnames( {
						'editor-confirmation-sidebar__sidebar': true,
						'is-active': this.props.isActive,
					} ) }>
						<div className="editor-confirmation-sidebar__ground-control">
							<div className="editor-confirmation-sidebar__cancel" onClick={ this.props.hideSidebar }>Cancel</div>
							<div className="editor-confirmation-sidebar__action">
								Are you sure? <Button onClick={ this.closeAndPublish } compact>Yea, do it!</Button>
							</div>
						</div>
					</div>
				</div>
			</RootChild>
		);
	}
}

export default localize( EditorConfirmationSidebar );
