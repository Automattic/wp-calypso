import { SelectDropdown } from '@automattic/components';
import { getWindowInnerWidth } from '@automattic/viewport';
import clsx from 'clsx';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Children, cloneElement, Component } from 'react';
import ReactDom from 'react-dom';
import TranslatableString from 'calypso/components/translatable/proptype';
import afterLayoutFlush from 'calypso/lib/after-layout-flush';

import './tabs.scss';

/**
 * Internal Variables
 */
const MOBILE_PANEL_THRESHOLD = 480;

/**
 * The NavTabs is a responsive components that provides multiple layout to fit both the container and the window.
 * 1. Horizontal Tabs - On desktop (viewport width > 480px).
 * 2. Expandable Vertical Tabs - On mobile (viewport width <= 480px).
 * 3. Dropdown - On desktop but the container width is smaller than the content width.
 */
class NavTabs extends Component {
	static propTypes = {
		selectedText: TranslatableString,
		selectedCount: PropTypes.number,
		label: PropTypes.string,
		hasSiblingControls: PropTypes.bool,
		hasHorizontalScroll: PropTypes.bool,
		enforceTabsView: PropTypes.bool,
	};

	static defaultProps = {
		hasSiblingControls: false,
		enforceTabsView: false,
	};

	state = {
		isDropdown: false,
		isFirstOverflow: false,
		isLastOverflow: false,
	};

	navGroupRef = createRef();
	tabListRef = createRef();
	tabRefMap = new Map();
	observer = null;

	componentDidMount() {
		this.setDropdownAfterLayoutFlush();
		if ( ! this.props.enforceTabsView ) {
			window.addEventListener( 'resize', this.setDropdownDebounced );
		}

		this.observe();
	}

	componentDidUpdate( prevProps, prevState ) {
		const { enforceTabsView } = this.props;
		const { isDropdown } = this.state;

		this.setDropdownAfterLayoutFlush();

		if ( ! prevProps.enforceTabsView && enforceTabsView ) {
			window.removeEventListener( 'resize', this.setDropdownDebounced );
		} else if ( prevProps.enforceTabsView && ! enforceTabsView ) {
			window.addEventListener( 'resize', this.setDropdownDebounced );
		}

		if ( prevState.isDropdown && ! isDropdown ) {
			this.observe();
		} else if ( ! prevState.isDropdown && isDropdown ) {
			this.unobserve();
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.setDropdownDebounced );
		// cancel the debounced `setDropdown` calls that might be already scheduled.
		// see https://lodash.com/docs/4.17.4#debounce to learn about the `cancel` method.
		this.setDropdownDebounced.cancel();
		this.setDropdownAfterLayoutFlush.cancel();
		this.unobserve();
	}

	/* Ref that stores the given tab element */
	storeTabRefs( index ) {
		return ( tabElement ) => {
			if ( tabElement === null ) {
				this.tabRefMap.delete( index );
			} else {
				this.tabRefMap.set( index, tabElement );
			}
		};
	}

	render() {
		const { isFirstOverflow, isLastOverflow } = this.state;
		const tabs = Children.map( this.props.children, ( child, index ) => {
			return child && cloneElement( child, { ref: this.storeTabRefs( index ) } );
		} );

		const isDropdownEnabled = this.isDropdownEnabled();

		const tabsClassName = clsx( 'section-nav-tabs', {
			'is-dropdown': isDropdownEnabled,
			'has-siblings': this.props.hasSiblingControls,
		} );

		const innerWidth = getWindowInnerWidth();

		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<div
				className={ clsx( {
					'section-nav-group': true,
					'has-horizontal-scroll':
						this.props.hasHorizontalScroll &&
						( innerWidth > MOBILE_PANEL_THRESHOLD || this.props.enforceTabsView ),
					'enforce-tabs-view': this.props.enforceTabsView,
				} ) }
				ref={ this.navGroupRef }
			>
				<div className={ tabsClassName }>
					{ this.props.label && <h6 className="section-nav-group__label">{ this.props.label }</h6> }
					<ul
						className={ clsx( 'section-nav-tabs__list', {
							'is-overflowing-first': isFirstOverflow,
							'is-overflowing-last': isLastOverflow,
						} ) }
						role="menu"
						ref={ this.tabListRef }
						onKeyDown={ this.keyHandler }
					>
						{ tabs }
					</ul>

					{ isDropdownEnabled && innerWidth > MOBILE_PANEL_THRESHOLD && this.getDropdown() }
				</div>
			</div>
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		);
	}

	getTabWidths() {
		let totalWidth = 0;

		this.tabRefMap.forEach( ( tabElement ) => {
			const tabWidth = ReactDom.findDOMNode( tabElement ).offsetWidth;
			totalWidth += tabWidth;
		} );

		this.tabsWidth = Math.max( totalWidth, this.tabsWidth || 0 );
	}

	isDropdownEnabled = () => {
		return ! this.props.enforceTabsView && this.state.isDropdown;
	};

	getDropdown() {
		const dropdownOptions = Children.map( this.props.children, ( child, index ) => {
			if ( ! child ) {
				return null;
			}
			return (
				<SelectDropdown.Item { ...child.props } key={ 'navTabsDropdown-' + index }>
					{ child.props.children }
				</SelectDropdown.Item>
			);
		} );

		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<SelectDropdown
				className="section-nav-tabs__dropdown"
				selectedText={ this.props.selectedText }
				selectedCount={ this.props.selectedCount }
			>
				{ dropdownOptions }
			</SelectDropdown>
			/* eslint-disable wpcalypso/jsx-classname-namespace */
		);
	}

	setDropdown = () => {
		if ( window.innerWidth > MOBILE_PANEL_THRESHOLD ) {
			if ( ! this.navGroupRef.current ) {
				return;
			}

			const navGroupWidth = this.navGroupRef.current.offsetWidth;
			this.getTabWidths();

			if (
				navGroupWidth <= this.tabsWidth &&
				! this.state.isDropdown &&
				! this.props.hasHorizontalScroll
			) {
				this.setState( {
					isDropdown: true,
				} );
			} else if ( navGroupWidth > this.tabsWidth && this.state.isDropdown ) {
				this.setState( {
					isDropdown: false,
				} );
			}
		} else if ( window.innerWidth <= MOBILE_PANEL_THRESHOLD && this.state.isDropdown ) {
			this.setState( {
				isDropdown: false,
			} );
		}
	};

	setDropdownDebounced = debounce( this.setDropdown, 300 );

	// setDropdown reads element sizes from DOM. If called synchronously in the middle of a React
	// update, it causes a synchronous layout reflow, doing the layout two or more times instead
	// of just once after all the DOM writes are finished. Prevent that by scheduling the call
	// just *after* the next layout flush.
	setDropdownAfterLayoutFlush = afterLayoutFlush( this.setDropdown );

	keyHandler = ( event ) => {
		switch ( event.keyCode ) {
			case 32: // space
			case 13: // enter
				event.preventDefault();
				document.activeElement.click();
				break;
		}
	};

	observe = () => {
		this.observer = new IntersectionObserver( this.checkIfOverflow, {
			threshold: 0.1,
		} );

		const { firstChild, lastChild } = this.tabListRef.current;
		if ( firstChild ) {
			this.observer?.observe( firstChild );
		}

		if ( lastChild ) {
			this.observer?.observe( lastChild );
		}
	};

	unobserve = () => {
		const { firstChild, lastChild } = this.tabListRef.current;
		if ( firstChild ) {
			this.observer?.unobserve( firstChild );
		}

		if ( lastChild ) {
			this.observer?.unobserve( lastChild );
		}

		this.observer?.disconnect();
		this.observer = null;
	};

	checkIfOverflow = ( entries ) => {
		const { firstChild, lastChild } = this.tabListRef.current;

		entries.forEach( ( entry ) => {
			if ( entry.target === firstChild ) {
				this.setState( { isFirstOverflow: ! entry.isIntersecting } );
			}
			if ( entry.target === lastChild ) {
				this.setState( { isLastOverflow: ! entry.isIntersecting } );
			}
		} );
	};
}

export default NavTabs;
