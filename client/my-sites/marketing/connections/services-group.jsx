/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getEligibleKeyringServices,
	isKeyringServicesFetching,
} from 'state/sharing/services/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import SectionHeader from 'components/section-header';
import Service from './service';
import * as Components from './services';
import ServicePlaceholder from './service-placeholder';

/**
 * Style dependencies
 */
import './services-group.scss';

/**
 * Module constants
 */
const NUMBER_OF_PLACEHOLDERS = 4;

const SharingServicesGroup = ( { isFetching, services, title } ) => {
	if ( ! services.length && ! isFetching ) {
		return null;
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="sharing-services-group">
			<SectionHeader label={ title } />
			<ul className="sharing-services-group__services">
				{ services.length
					? services.map( service => {
							const Component = Components.hasOwnProperty( service.ID )
								? Components[ service.ID ]
								: Service;

							return <Component key={ service.ID } service={ service } />;
					  } )
					: times( NUMBER_OF_PLACEHOLDERS, index => (
							<ServicePlaceholder key={ 'service-placeholder-' + index } />
					  ) ) }
			</ul>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

SharingServicesGroup.propTypes = {
	isFetching: PropTypes.bool,
	services: PropTypes.array,
	title: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
};

SharingServicesGroup.defaultProps = {
	isFetching: false,
	services: [],
};

export default connect( ( state, { type } ) => ( {
	isFetching: isKeyringServicesFetching( state ),
	services: getEligibleKeyringServices( state, getSelectedSiteId( state ), type ),
} ) )( SharingServicesGroup );
