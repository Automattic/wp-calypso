import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Children, cloneElement, Component } from 'react';
import Search from 'calypso/components/search';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import CommentNavigationTab from 'calypso/my-sites/comments/comment-navigation/comment-navigation-tab';

import './style.scss';

class SectionNav extends Component {
	static propTypes = {
		selectedText: PropTypes.node,
		selectedCount: PropTypes.number,
		hasPinnedItems: PropTypes.bool,
		onMobileNavPanelOpen: PropTypes.func,
		className: PropTypes.string,
		allowDropdown: PropTypes.bool,
		variation: PropTypes.string,
		children: PropTypes.node,
		enforceTabsView: PropTypes.bool,
	};

	static defaultProps = {
		onMobileNavPanelOpen: () => {},
		allowDropdown: true,
	};

	state = {
		mobileOpen: false,
	};

	hasPinnedSearch = false;

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		this.checkForSiblingControls( this.props.children );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
			className = clsx( 'section-nav', 'is-empty', this.props.className );

			return (
				<div className={ className }>
					<div className="section-nav__panel">
						<NavItem />
					</div>
				</div>
			);
		}

		className = clsx( 'section-nav', this.props.className, {
			'is-open': this.state.mobileOpen,
			'section-nav-updated': this.props.applyUpdatedStyles,
			'has-pinned-items': this.hasPinnedSearch || this.props.hasPinnedItems,
			minimal: 'minimal' === this.props.variation,
			'enforce-tabs-view': this.props.enforceTabsView,
		} );

		return (
			<div className={ className }>
				{ this.renderDropdown() }
				<div className="section-nav__panel">{ children }</div>
			</div>
		);
	}

	getChildren() {
		this.hasPinnedSearch = false;
		return Children.map( this.props.children, ( child ) => {
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

			// Propagate 'enforceTabsView' to NavItem component
			if ( child.type === NavTabs && this.props.enforceTabsView ) {
				extraProps.enforceTabsView = this.props.enforceTabsView;
			}

			if ( child.type === Search ) {
				if ( child.props.pinned ) {
					this.hasPinnedSearch = true;

					extraProps.onSearchOpen = this.generateOnSearchOpen( child.props.onSearchOpen );
				}

				extraProps.onSearch = this.generateOnSearch( child.props.onSearch );
			}

			return cloneElement( child, extraProps );
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

	generateOnSearchOpen( existingOnSearchOpen ) {
		return ( ...args ) => {
			existingOnSearchOpen( ...args );
			this.closeMobilePanel();
		};
	}

	checkForSiblingControls( children ) {
		this.hasSiblingControls = false;

		const ignoreSiblings = [ Search, CommentNavigationTab ];

		Children.forEach( children, ( child, index ) => {
			// Checking for at least 2 controls groups that are not null or ignored siblings
			if ( index && child && ! includes( ignoreSiblings, child.type ) ) {
				this.hasSiblingControls = true;
			}
		} );
	}
}

export default SectionNav;
