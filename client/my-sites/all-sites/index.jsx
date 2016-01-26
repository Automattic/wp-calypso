/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:all-sites' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var AllSitesIcon = require( 'my-sites/all-sites-icon' ),
	Count = require( 'components/count' ),
	user = require( 'lib/user' )();

module.exports = React.createClass( {
	displayName: 'AllSites',

	componentDidMount: function() {
		debug( 'The All Sites component is mounted.' );
	},

	getDefaultProps: function() {
		return {
			// onSelect callback
			onSelect: function() {},

			// Set a href attribute to the anchor
			href: null,

			// Mark as selected or not
			isSelected: false,
			showCount: true
		};
	},

	propTypes: {
		sites: React.PropTypes.object.isRequired,
		onSelect: React.PropTypes.func,
		href: React.PropTypes.string,
		isSelected: React.PropTypes.bool,
		showCount: React.PropTypes.bool
	},

	onSelect: function( event ) {
		this.props.onSelect( event );
	},

	render: function() {
		var allSitesClass;

		allSitesClass = classNames( {
			'all-sites': true,
			'is-selected': this.props.isSelected
		} );

		return (
			<div className={ allSitesClass }>
				<a className="site__content" href={ this.props.href } onTouchTap={ this.onSelect }>
					<AllSitesIcon sites={ this.props.sites.get() } />
					<div className="site__info">
						<span className="site__title">{ this.translate( 'All My Sites' ) }</span>
						<span className="site__domain">{ this.translate( 'Manage all my sites' ) }</span>
					</div>
					{ this.props.showCount && <Count count={ user.get().visible_site_count } /> }
				</a>
			</div>
		);
	}
} );
