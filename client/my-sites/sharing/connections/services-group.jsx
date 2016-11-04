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
		connections: PropTypes.object,
		description: PropTypes.string,
		services: PropTypes.array,
		title: PropTypes.string.isRequired,
	};

	static defaultProps = {
		connections: Object.freeze( {} ),
		description: '',
		services: Object.freeze( [] ),
	};

	render() {
		const classes = classNames( 'sharing-services-group', {
			'is-empty': ! this.props.services.length
		} );

		return (
			<div className={ classes }>
				<QueryKeyringServices />
				<SectionHeader label={ this.props.title } />
				<ul className="sharing-services-group__services">
					{ this.props.services.length
						? this.props.services.map( ( service ) =>
							<Service
								key={ service.ID }
								connections={ this.props.connections }
								service={ service } /> )
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
