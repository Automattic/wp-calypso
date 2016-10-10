/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getEligibleKeyringServices } from 'state/sharing/services/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import QueryKeyringServices from 'components/data/query-keyring-services';
import SectionHeader from 'components/section-header';
import Service from './service';
import ServicePlaceholder from './service-placeholder';

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

	renderService( service ) {
		return <Service
			key={ service.ID }
			service={ service }
			{ ...this.props } />;
	}

	renderServicePlaceholders() {
		// The Array constructor isn't used here because constructed arrays
		// can't be mapped since it doesn't truly contain any values
		return Array.apply( null, new Array( NUMBER_OF_PLACEHOLDERS ) ).map( ( value, i ) =>
			<ServicePlaceholder key={ 'service-placeholder-' + i } />
		);
	}

	renderServices() {
		if ( this.props.initialized ) {
			return this.props.services.map( this.renderService, this );
		}
		return this.renderServicePlaceholders();
	}

	render() {
		const classes = classNames( 'sharing-services-group', {
			'is-empty': this.props.initialized && ! this.props.services.length
		} );

		return (
			<div className={ classes }>
				<QueryKeyringServices />
				<SectionHeader label={ this.props.title } />
				<ul className="sharing-services-group__services">
					{ this.renderServices() }
				</ul>
			</div>
		);
	}
}

export default connect(
	( state, { type } ) => ( {
		services: getEligibleKeyringServices( state, getSelectedSiteId( state ), type )
	} ),
)( SharingServicesGroup );
