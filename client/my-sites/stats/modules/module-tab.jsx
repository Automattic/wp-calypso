/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	Gridicon = require( 'components/gridicon' );

/**
 * Internal dependencies
 */

module.exports = React.createClass( {
	displayName: 'StatModuleTab',

	clickHandler: function( event ) {
		if ( 'function' === typeof ( this.props.tabClick ) ) {
			event.preventDefault();
			this.props.tabClick( this.props.tab );
		}
	},

	ensureValue: function( value ) {
		if ( ( ! this.props.tab.loading ) && ( value || value === 0 ) ) {
			return this.numberFormat( value );
		} else {
			// If no value present, return en-dash
			return String.fromCharCode( 8211 );
		}
	},

	handleLinkClick: function( event ) {
		if ( ! this.props.href ) {
			event.preventDefault();
		}
	},

	render: function() {
		var tab = this.props.tab,
			tabClassOptions,
			tabClassSet,
			href = tab.href ? tab.href : '#';

		tabClassOptions = {
			'is-selected': tab.selected,
			'is-loading': tab.loading,
			'is-low': ! tab.value
		};

		tabClassOptions[ 'is-' + tab.attr ] = true;
		tabClassSet = classNames( tabClassOptions );


		return (
			<li className={ 'module-tab ' + tabClassSet } onClick={ this.clickHandler } >
				<a href={ href } onClick={ this.handleLinkClick }><Gridicon icon={ tab.className } size={ 18 } /><span className="label">{ tab.label }</span><span className="value">{ this.ensureValue( tab.value ) }</span></a>
			</li>
		);
	}
} );
