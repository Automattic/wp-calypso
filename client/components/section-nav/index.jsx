/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { includes } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import CommentNavigationTab from 'my-sites/comments/comment-navigation/comment-navigation-tab';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Search from 'components/search';

/**
 * Style dependencies
 */
import './style.scss';

class SectionNav extends Component {
	static propTypes = {
		selectedText: PropTypes.node,
		selectedCount: PropTypes.number,
		hasPinnedItems: PropTypes.bool,
		onMobileNavPanelOpen: PropTypes.func,
		className: PropTypes.string,
		allowDropdown: PropTypes.bool,
	};

	static defaultProps = {
		onMobileNavPanelOpen: () => {},
		allowDropdown: true,
	};

	state = {
		mobileOpen: false,
	};

	UNSAFE_componentWillMount() {
		this.checkForSiblingControls( this.props.children );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.checkForSiblingControls( nextProps.children );

		if ( ! this.hasSiblingControls ) {
			this.closeMobilePanel();
		}
	}

	renderDropdown() {
		if ( ! this.props.allowDropdown ) {
			return null;
		}

		return (
			<button className="section-nav__mobile-header" onClick={ this.toggleMobileOpenState }>
				<span className="section-nav__mobile-header-text">{ this.props.selectedText }</span>
				<Gridicon icon="chevron-down" size={ 18 } />
			</button>
		);
	}

	render() {
		const children = this.getChildren();
		let className;

		if ( ! children ) {
			className = classNames( 'section-nav', 'is-empty', this.props.className );

			return (
				<div className={ className }>
					<div className="section-nav__panel">
						<NavItem />
					</div>
				</div>
			);
		}

		className = classNames( 'section-nav', this.props.className, {
			'is-open': this.state.mobileOpen,
			'has-pinned-items': this.hasPinnedSearch || this.props.hasPinnedItems,
		} );

		return (
			<div className={ className }>
				{ this.renderDropdown() }
				<div className="section-nav__panel">{ children }</div>
			</div>
		);
	}

	getChildren() {
		return React.Children.map( this.props.children, ( child ) => {
			const extraProps = {
				hasSiblingControls: this.hasSiblingControls,
				closeSectionNavMobilePanel: this.closeMobilePanel,
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
		} );
	}

	closeMobilePanel = () => {
		if ( window.innerWidth < 480 && this.state.mobileOpen ) {
			this.setState( {
				mobileOpen: false,
			} );
		}
	};

	toggleMobileOpenState = () => {
		const mobileOpen = ! this.state.mobileOpen;

		this.setState( {
			mobileOpen: mobileOpen,
		} );

		if ( mobileOpen ) {
			this.props.onMobileNavPanelOpen();
		}
	};

	generateOnSearch( existingOnSearch ) {
		return ( ...args ) => {
			existingOnSearch( ...args );
			this.closeMobilePanel();
		};
	}

	checkForSiblingControls( children ) {
		this.hasSiblingControls = false;

		const ignoreSiblings = [ Search, CommentNavigationTab ];

		React.Children.forEach( children, ( child, index ) => {
			// Checking for at least 2 controls groups that are not null or ignored siblings
			if ( index && child && ! includes( ignoreSiblings, child.type ) ) {
				this.hasSiblingControls = true;
			}
		} );
	}
}

export default SectionNav;
