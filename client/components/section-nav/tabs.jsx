/**
 * External dependencies
 */
import { getWindowInnerWidth } from '@automattic/viewport';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { debounce } from 'lodash';

/**
 * Internal Dependencies
 */
import SelectDropdown from 'components/select-dropdown';
import afterLayoutFlush from 'lib/after-layout-flush';
import TranslatableString from 'components/translatable/proptype';

/**
 * Style dependencies
 */
import './tabs.scss';

/**
 * Internal Variables
 */
const MOBILE_PANEL_THRESHOLD = 480;

class NavTabs extends Component {
	static propTypes = {
		selectedText: TranslatableString,
		selectedCount: PropTypes.number,
		label: PropTypes.string,
		hasSiblingControls: PropTypes.bool,
	};

	static defaultProps = {
		hasSiblingControls: false,
	};

	state = {
		isDropdown: false,
	};

	navGroupRef = React.createRef();
	tabRefMap = new Map();

	componentDidMount() {
		this.setDropdownAfterLayoutFlush();
		window.addEventListener( 'resize', this.setDropdownDebounced );
	}

	componentDidUpdate() {
		this.setDropdownAfterLayoutFlush();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.setDropdownDebounced );
		// cancel the debounced `setDropdown` calls that might be already scheduled.
		// see https://lodash.com/docs/4.17.4#debounce to learn about the `cancel` method.
		this.setDropdownDebounced.cancel();
		this.setDropdownAfterLayoutFlush.cancel();
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
		const tabs = React.Children.map( this.props.children, ( child, index ) => {
			return child && React.cloneElement( child, { ref: this.storeTabRefs( index ) } );
		} );

		const tabsClassName = classNames( 'section-nav-tabs', {
			'is-dropdown': this.state.isDropdown,
			'is-open': this.state.isDropdownOpen,
			'has-siblings': this.props.hasSiblingControls,
		} );

		const innerWidth = getWindowInnerWidth();

		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<div className="section-nav-group" ref={ this.navGroupRef }>
				<div className={ tabsClassName }>
					{ this.props.label && <h6 className="section-nav-group__label">{ this.props.label }</h6> }
					<ul className="section-nav-tabs__list" role="menu" onKeyDown={ this.keyHandler }>
						{ tabs }
					</ul>

					{ this.state.isDropdown && innerWidth > MOBILE_PANEL_THRESHOLD && this.getDropdown() }
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

	getDropdown() {
		const dropdownOptions = React.Children.map( this.props.children, ( child, index ) => {
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

			if ( navGroupWidth <= this.tabsWidth && ! this.state.isDropdown ) {
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
}

export default NavTabs;
