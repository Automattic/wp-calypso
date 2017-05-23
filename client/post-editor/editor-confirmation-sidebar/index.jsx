/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
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
	};

	stopPropagation( event ) {
		event.stopPropagation();
	}

	render() {
		return (
			<RootChild>
				<div className={ classnames( {
						'editor-confirmation-sidebar': true,
						'is-active': this.props.isActive,
				} ) } >
					<div className={ classnames( {
						'editor-confirmation-sidebar__overlay': true,
						'is-active': this.props.isActive,
					} ) } onClick={ this.props.hideSidebar }></div>
					<div className={ classnames( {
						'editor-confirmation-sidebar__sidebar': true,
						'is-active': this.props.isActive,
					} ) } onClick={ this.stopPropagation }>
						<div className="editor-confirmation-sidebar__ground-control">
							<div className="editor-confirmation-sidebar__cancel" onClick={ this.props.hideSidebar }>Cancel</div>
							<div className="editor-confirmation-sidebar__action">
								Are you sure? <Button compact>Yea, do it!</Button>
							</div>
						</div>
					</div>
				</div>
			</RootChild>
		);
	}
}

export default localize( EditorConfirmationSidebar );
