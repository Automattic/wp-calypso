/**
 * External dependencies
 */
var React = require( 'react' ),
	get = require( 'lodash/object/get' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Service = require( './service' ),
	ServicePlaceholder = require( './service-placeholder' ),
	SectionHeader = require( 'components/section-header' );

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
		const { site, services } = this.props;

		if ( ! site ) {
			return services;
		}

		return services.filter( function( service ) {
			// Omit if the site is Jetpack and service doesn't support Jetpack
			if ( site.jetpack && ! service.jetpack_support ) {
				return false;
			}

			// Omit if Jetpack module not activated
			if ( site.jetpack && service.jetpack_module_required &&
					! site.isModuleActive( service.jetpack_module_required ) ) {
				return false;
			}

			// Omit if service is settings-oriented and user cannot manage
			if ( 'eventbrite' === service.name && ! site.user_can_manage ) {
				return false;
			}

			// Omit if Publicize service and user cannot publish
			if ( 'publicize' === service.type && ! get( site, 'capabilities.publish_posts' ) ) {
				return false;
			}

			return true;
		} );
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
				<SectionHeader label={ this.props.title } />
				<ul className="sharing-services-group__services">
					{ this.renderServices( services ) }
				</ul>
			</div>
		);
	}
} );
