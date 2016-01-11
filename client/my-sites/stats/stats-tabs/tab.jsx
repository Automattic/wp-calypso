/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'StatsTabsTab',

	propTypes: {
		attr: PropTypes.string,
		className: PropTypes.string,
		label: PropTypes.string,
		loading: PropTypes.bool,
		selected: PropTypes.bool,
		tabClick: PropTypes.func,
		value: PropTypes.number
	},

	getDefaultProps() {
		return {
			tabClick: () => {},
			href: '#'
		}
	},

	clickHandler( event ) {
		event.preventDefault();
		this.props.tabClick( this.props );
	},

	ensureValue( value ) {
		if ( ( ! this.props.loading ) && ( value || value === 0 ) ) {
			return this.numberFormat( value );
		}

		return String.fromCharCode( 8211 );
	},

	handleLinkClick( event ) {
		if ( ! this.props.href ) {
			event.preventDefault();
		}
	},

	render() {
		const { attr, className, href, label, loading, selected, value } = this.props;

		const tabClassOptions = {
			'is-selected': selected,
			'is-loading': loading,
			'is-low': ! value
		};

		tabClassOptions[ 'is-' + attr ] = true;

		return (
			<li className={ classNames( 'module-tab', tabClassOptions ) } onClick={ this.clickHandler } >
				<a href={ href } onClick={ this.handleLinkClick }>
					<Gridicon icon={ className } size={ 18 } />
					<span className="label">{ label }</span>
					<span className="value">{ this.ensureValue( value ) }</span>
				</a>
			</li>
		);
	}
} );
