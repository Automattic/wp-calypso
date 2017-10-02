/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import { hasTouch } from 'lib/touch-detect';
import SiteSelector from 'components/site-selector';

module.exports = React.createClass( {
	displayName: 'SitesPopover',

	propTypes: {
		showDelay: PropTypes.number,
		context: PropTypes.object,
		visible: PropTypes.bool,
		onClose: PropTypes.func,
		position: PropTypes.string,
		id: PropTypes.string,
		groups: PropTypes.bool,
		className: PropTypes.string
	},

	getInitialState: function() {
		return {
			popoverVisible: false
		};
	},

	getDefaultProps: function() {
		return {
			visible: false,
			onClose: noop,
			position: 'bottom left',
			groups: false,
			siteQuerystring: false,
			className: ''
		};
	},

	componentDidMount: function() {
		this.updatePopoverVisibilityState();
	},

	componentDidUpdate: function( prevProps ) {
		if ( this.props.visible !== prevProps.visible ) {
			this.updatePopoverVisibilityState();
		}
	},

	updatePopoverVisibilityState: function() {
		this.setState( {
			popoverVisible: this.props.visible
		} );
	},

	renderHeader() {
		return (
			<div className="sites-popover__header">
				{ this.props.header }
			</div>
		);
	},

	renderSiteSelector() {
		return (
			<SiteSelector
				siteBasePath="/post"
				onSiteSelect={ this.props.onSiteSelect }
				showAddNewSite={ false }
				indicator={ false }
				autoFocus={ ! hasTouch() }
				groups={ true }
				onClose={ this.props.onClose } />
		);
	},

	render: function() {
		let classes = classnames(
			this.props.className,
			'popover sites-popover',
			this.props.header && 'has-header'
		);

		return (
			<Popover
				id={ this.props.id }
				showDelay={ this.props.showDelay }
				isVisible={ this.props.visible }
				context={ this.props.context }
				onClose={ this.props.onClose }
				position={ this.props.position }
				className={ classes }
			>
				{ this.renderHeader() }
				{ this.renderSiteSelector() }
			</Popover>
		);
	}
} );
