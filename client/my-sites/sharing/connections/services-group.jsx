/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Service = require( './service' ),
	ServicePlaceholder = require( './service-placeholder' );

/**
 * Module variables
 */
var NUMBER_OF_PLACEHOLDERS = 4;

module.exports = React.createClass( {
	displayName: 'SharingServicesGroup',

	propTypes: {
		site: React.PropTypes.object,
		user: React.PropTypes.object,
		connections: React.PropTypes.object,
		onAddConnection: React.PropTypes.func,
		onRemoveConnection: React.PropTypes.func,
		onRefreshConnection: React.PropTypes.func,
		onToggleSitewideConnection: React.PropTypes.func,
		initialized: React.PropTypes.bool,
		services: React.PropTypes.array,
		title: React.PropTypes.string.isRequired,
		description: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			onAddConnection: function() {},
			onRemoveConnection: function() {},
			onRefreshConnection: function() {},
			onToggleSitewideConnection: function() {},
			initialized: false
		};
	},

	getEligibleServices: function() {
		// Currently, we only filter services by Jetpack support. If the site
		// isn't a Jetpack site, we can be assured all services are supported.
		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return this.props.services;
		}

		return this.props.services.filter( function( service ) {
			// Omit the service if it doesn't support Jetpack or if the
			// required Jetpack module is not currently active
			return service.jetpack_support && ( ! service.jetpack_module_required ||
				this.props.site.isModuleActive( service.jetpack_module_required ) );
		}, this );
	},

	renderService: function( service ) {
		return <Service
			key={ service.name }
			site={ this.props.site }
			user={ this.props.user }
			service={ service }
			connections={ this.props.connections }
			onAddConnection={ this.props.onAddConnection }
			onRemoveConnection={ this.props.onRemoveConnection }
			onRefreshConnection={ this.props.onRefreshConnection }
			onToggleSitewideConnection={ this.props.onToggleSitewideConnection } />;
	},

	renderServicePlaceholders: function() {
		// The Array constructor isn't used here because constructed arrays
		// can't be mapped since it doesn't truly contain any values
		return Array.apply( null, Array( NUMBER_OF_PLACEHOLDERS ) ).map( function( value, i ) {
			return <ServicePlaceholder key={ 'service-placeholder-' + i } />;
		} );
	},

	renderServices: function( services ) {
		if ( this.props.initialized ) {
			return services.map( this.renderService, this );
		} else {
			return this.renderServicePlaceholders();
		}
	},

	render: function() {
		var services = this.getEligibleServices(),
			classes = classNames( 'sharing-services-group', {
				'is-empty': this.props.initialized && ! services.length
			} );

		return (
			<div className={ classes }>
				<header className="sharing-services-group__header">
					<h3 className="sharing-service-group__title">{ this.props.title }</h3>
					<p className="sharing-services-group__intro">{ this.props.description }</p>
				</header>
				<ul className="sharing-services-group__services">
					{ this.renderServices( services ) }
				</ul>
			</div>
		);
	}
} );
