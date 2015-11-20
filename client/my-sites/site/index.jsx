/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site' ),
	classNames = require( 'classnames' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var SiteIcon = require( 'components/site-icon' ),
	SiteIndicator = require( 'my-sites/site-indicator' );

module.exports = React.createClass( {
	displayName: 'Site',

	componentDidMount: function() {
		debug( 'The Site component is mounted.' );
	},

	getDefaultProps: function() {
		return {
			// onSelect callback
			onSelect: noop,
			// mouse event callbacks
			onMouseEnter: noop,
			onMouseLeave: noop,

			// Set a href attribute to the anchor
			href: null,

			// Choose to show the SiteIndicator
			indicator: true,

			// Mark as selected or not
			isSelected: false
		};
	},

	propTypes: {
		href: React.PropTypes.string,
		externalLink: React.PropTypes.bool,
		indicator: React.PropTypes.bool,
		onSelect: React.PropTypes.func,
		onMouseEnter: React.PropTypes.func,
		onMouseLeave: React.PropTypes.func,
		isSelected: React.PropTypes.bool,
		site: React.PropTypes.object.isRequired
	},

	onSelect: function( event ) {
		this.props.onSelect( event );
		event.preventDefault();
	},

	render: function() {
		var site = this.props.site,
			siteClass;

		siteClass = classNames( {
			'site': true,
			'is-jetpack': site.jetpack,
			'is-primary': site.primary,
			'is-private': site.is_private,
			'is-redirect': site.options && site.options.is_redirect,
			'is-selected': this.props.isSelected
		} );

		return (
			<div className={ siteClass }>
				<a className="site__content"
					href={ this.props.href }
					target={ this.props.externalLink && '_blank' }
					onTouchTap={ this.onSelect }
					onMouseEnter={ this.props.onMouseEnter }
					onMouseLeave={ this.props.onMouseLeave }
					aria-label={ this.translate( 'Open site %(domain)s in new tab', { args: { domain: site.domain } } ) }
				>
					<SiteIcon site={ site } />
					<div className="site__info">
						<div className="site__title">{ site.title }</div>
						<div className="site__domain">{ site.domain }</div>
					</div>
				</a>
				{ this.props.indicator ? <SiteIndicator site={ site } /> : null }
			</div>
		);
	}
} );
