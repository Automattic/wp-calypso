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
		className: PropTypes.string,
		gridicon: PropTypes.string,
		label: PropTypes.string,
		loading: PropTypes.bool,
		selected: PropTypes.bool,
		tabClick: PropTypes.func,
		value: PropTypes.number
	},

	getDefaultProps() {
		return {
			tabClick: () => {}
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
		const { className, children, gridicon, href, label, loading, selected, value } = this.props;

		const tabClass = classNames(
			'stats-tab',
			className,
			{
				'is-selected': selected,
				'is-loading': loading,
				'is-low': ! value
			} );

		const linkClass = ! href ? 'no-link' : null;

		return (
			<li className={ tabClass } onClick={ this.clickHandler } >
				<a href={ href } className={ linkClass } onClick={ this.handleLinkClick }>
					{ gridicon ? <Gridicon icon={ gridicon } size={ 18 } /> : null }
					<span className="label">{ label }</span>
					<span className="value">{ this.ensureValue( value ) }</span>
					{ children }
				</a>
			</li>
		);
	}
} );
