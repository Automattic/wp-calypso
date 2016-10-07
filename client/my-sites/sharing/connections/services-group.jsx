/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { getKeyringServices } from 'state/sharing/services/selectors';
import QueryKeyringServices from 'components/data/query-keyring-services';
import SectionHeader from 'components/section-header';
import Service from './service';
import ServicePlaceholder from './service-placeholder';
import utils from 'lib/site/utils';

/**
 * Module constants
 */
const NUMBER_OF_PLACEHOLDERS = 4;

class SharingServicesGroup extends Component {

	static propTypes = {
		site: PropTypes.object,
		user: PropTypes.object,
		connections: PropTypes.object,
		onAddConnection: PropTypes.func,
		onRemoveConnection: PropTypes.func,
		onRefreshConnection: PropTypes.func,
		onToggleSitewideConnection: PropTypes.func,
		initialized: PropTypes.bool,
		services: PropTypes.array,
		title: PropTypes.string.isRequired,
		description: PropTypes.string
	};

	static defaultProps = {
		onAddConnection: function() {},
		onRemoveConnection: function() {},
		onRefreshConnection: function() {},
		onToggleSitewideConnection: function() {},
		initialized: false
	};

	getEligibleServices() {
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
			if ( 'eventbrite' === service.ID && ! utils.userCan( 'manage_options', site ) ) {
				return false;
			}

			// Omit if Publicize service and user cannot publish
			if ( 'publicize' === service.type && ! utils.userCan( 'publish_posts', site ) ) {
				return false;
			}

			return true;
		} );
	}

	renderService( service ) {
		return <Service
			key={ service.ID }
			site={ this.props.site }
			user={ this.props.user }
			service={ service }
			connections={ this.props.connections }
			onAddConnection={ this.props.onAddConnection }
			onRemoveConnection={ this.props.onRemoveConnection }
			onRefreshConnection={ this.props.onRefreshConnection }
			onToggleSitewideConnection={ this.props.onToggleSitewideConnection } />;
	}

	renderServicePlaceholders() {
		// The Array constructor isn't used here because constructed arrays
		// can't be mapped since it doesn't truly contain any values
		return Array.apply( null, new Array( NUMBER_OF_PLACEHOLDERS ) ).map( ( value, i ) =>
			<ServicePlaceholder key={ 'service-placeholder-' + i } />
		);
	}

	renderServices( services ) {
		if ( this.props.initialized ) {
			return services.map( this.renderService, this );
		}
		return this.renderServicePlaceholders();
	}

	render() {
		const services = this.getEligibleServices(),
			classes = classNames( 'sharing-services-group', {
				'is-empty': this.props.initialized && ! services.length
			} );

		return (
			<div className={ classes }>
				<QueryKeyringServices />
				<SectionHeader label={ this.props.title } />
				<ul className="sharing-services-group__services">
					{ this.renderServices( services ) }
				</ul>
			</div>
		);
	}
}

export default connect(
	( state, { type } ) => ( {
		services: filter( getKeyringServices( state ), { type: type } )
	} ),
)( SharingServicesGroup );
