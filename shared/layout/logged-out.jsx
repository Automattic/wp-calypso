/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Masterbar = require( './masterbar' ),
	NoticesList = require( 'notices/notices-list' ),
	notices = require( 'notices' );

module.exports = React.createClass( {
	displayName: 'LayoutLoggedOut',

	getInitialState: function() {
		return {
			section: undefined
		};
	},

	render: function() {
		var sectionClass = 'wp' + ( this.state.section ? ' is-section-' + this.state.section : '' );

		return (
			<div className={ sectionClass }>
				<Masterbar />
				<div id="content" className="wp-content">
					<NoticesList id="notices" notices={ notices.list } />
					<div id="primary" className="wp-primary wp-section" />
					<div id="secondary" className="wp-secondary" />
				</div>
				<div id="tertiary" className="wp-overlay fade-background" />
			</div>
		);
	}

} );
