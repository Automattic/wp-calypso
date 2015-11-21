/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */

var StatTab = require( './module-tab' );

module.exports = React.createClass( {
	displayName: 'StatModuleTabs',

	render: function() {
		var tabs,
			data;

		data = this.props.dataList.response.data.filter( function( item ) {
			return item[ this.props.activeKey ] === this.props.activeIndex;
		}, this );

		if ( data.length ) {
			data = data.pop();
		}

		tabs = this.props.tabs.map( function( tab ){
			var tabOptions,
				hasData = data && ( data[ tab.attr ] >= 0 ) && ( data[ tab.attr ] !== null );

			tabOptions = {
				attr: tab.attr,
				value: hasData ? data[ tab.attr ] : null,
				selected: ( this.props.selectedTab === tab.attr ),
				className: tab.className,
				label: tab.label,
				loading: ! hasData
			};

			return (
				<StatTab key={ tab.attr } tab={ tabOptions } tabClick={ this.props.switchTab } />
			);
		}, this );

		return (
			<ul className="module-tabs is-enabled">
				{ tabs }
			</ul>
		);
	}
} );
