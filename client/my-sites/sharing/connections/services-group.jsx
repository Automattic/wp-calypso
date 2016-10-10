/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { times } from 'lodash';

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

	render() {
		const classes = classNames( 'sharing-services-group', {
			'is-empty': this.props.initialized && ! this.props.services.length
		} );

		return (
			<div className={ classes }>
				<QueryKeyringServices />
				<SectionHeader label={ this.props.title } />
				<ul className="sharing-services-group__services">
					{ this.props.initialized
						? this.props.services.map( ( service ) =>
							<Service
								key={ service.ID }
								service={ service }
								{ ...this.props } /> )
						: times( NUMBER_OF_PLACEHOLDERS, ( index ) =>
							<ServicePlaceholder
								key={ 'service-placeholder-' + index } /> )
					}
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
