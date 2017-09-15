/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import classNames from 'classnames';
import {
	isEqual,
	includes,
} from 'lodash';

/**
 * Internal Dependencies
 */
import CommentNavigationTab from 'my-sites/comments/comment-navigation/comment-navigation-tab';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';

/**
 * Main
 */
var SectionNav = React.createClass( {

	propTypes: {
		children: PropTypes.node,
		selectedText: PropTypes.node,
		selectedCount: PropTypes.number,
		hasPinnedItems: PropTypes.bool,
		onMobileNavPanelOpen: PropTypes.func,
		className: PropTypes.string,
		allowDropdown: PropTypes.bool,
	},

	getInitialState: function() {
		return {
			mobileOpen: false
		};
	},

	getDefaultProps: function() {
		return {
			onMobileNavPanelOpen: () => {},
			allowDropdown: true,
		};
	},

	componentWillMount: function() {
		this.checkForSiblingControls( this.props.children );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( isEqual( this.props, nextProps ) ) {
			return;
		}

		this.checkForSiblingControls( nextProps.children );

		if ( ! this.hasSiblingControls ) {
			this.closeMobilePanel();
		}
	},

	renderDropdown() {
		if ( ! this.props.allowDropdown ) {
			return <div />;
		}

		return (
			<div
				className="section-nav__mobile-header"
				onClick={ this.toggleMobileOpenState }
			>
				<span className="section-nav__mobile-header-text">
					{ this.props.selectedText }
				</span>
			</div>
		);
	},

	render: function() {
		var children = this.getChildren(),
			className;

		if ( ! children ) {
			className = classNames( {
				'section-nav': true,
				'is-empty': true
			}, this.props.className );

			return (
				<div className={ className }>
					<div className="section-nav__panel">
						<NavItem></NavItem>
					</div>
				</div>
			);
		}

		className = classNames( {
			'section-nav': true,
			'is-open': this.state.mobileOpen,
			'has-pinned-items': this.hasPinnedSearch || this.props.hasPinnedItems
		}, this.props.className );

		return (
			<div className={ className }>
				{ this.renderDropdown() }

				<div className="section-nav__panel">
					{ children }
				</div>
			</div>
		);
	},

	getChildren: function() {
		return React.Children.map( this.props.children, function( child ) {
			var extraProps = {
				hasSiblingControls: this.hasSiblingControls,
				closeSectionNavMobilePanel: this.closeMobilePanel
			};

			if ( ! child ) {
				return null;
			}

			// Propagate 'selectedText' to NavItem component
			if (
				child.type === NavTabs &&
				! child.props.selectedText &&
				typeof this.props.selectedText === 'string'
			) {
				extraProps.selectedText = this.props.selectedText;
			}

			// Propagate 'selectedCount' to NavItem component
			if ( child.type === NavTabs && this.props.selectedCount ) {
				extraProps.selectedCount = this.props.selectedCount;
			}

			if ( child.type === Search ) {
				if ( child.props.pinned ) {
					this.hasPinnedSearch = true;
				}

				extraProps.onSearch = this.generateOnSearch( child.props.onSearch );
			}

			return React.cloneElement( child, extraProps );
		}.bind( this ) );
	},

	closeMobilePanel: function() {
		if ( window.innerWidth < 480 && this.state.mobileOpen ) {
			this.setState( {
				mobileOpen: false
			} );
		}
	},

	toggleMobileOpenState: function() {
		var mobileOpen = ! this.state.mobileOpen;

		this.setState( {
			mobileOpen: mobileOpen
		} );

		if ( mobileOpen ) {
			this.props.onMobileNavPanelOpen();
		}
	},

	generateOnSearch: function( existingOnSearch ) {
		return function() {
			existingOnSearch.apply( this, arguments );
			this.closeMobilePanel();
		}.bind( this );
	},

	checkForSiblingControls: function( children ) {
		this.hasSiblingControls = false;

		const ignoreSiblings = [ Search, CommentNavigationTab ];

		React.Children.forEach( children, function( child, index ) {
			// Checking for at least 2 controls groups that are not null or ignored siblings
			if ( index && child && ! includes( ignoreSiblings, child.type ) ) {
				this.hasSiblingControls = true;
			}
		}.bind( this ) );
	}
} );

module.exports = SectionNav;
