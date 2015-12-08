/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

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
			section: undefined,
			noSidebar: false
		};
	},

	render: function() {
		var sectionClass = this.state.section ? ' is-section-' + this.state.section : '',
			classes = classNames( 'wp', sectionClass, {
				'has-no-sidebar': this.state.noSidebar
			} );

		return (
			<div className={ classes }>
				<Masterbar />
				<div id="content" className="wp-content">
					<NoticesList id="notices" notices={ notices.list } />
					<div id="primary" className="wp-primary wp-section">
						{ this.props.primary }
					</div>
					<div id="secondary" className="wp-secondary">
						{ this.props.secondary }
					</div>
				</div>
				<div id="tertiary">
					{ this.props.tertiary }
				</div>
			</div>
		);
	}

} );
