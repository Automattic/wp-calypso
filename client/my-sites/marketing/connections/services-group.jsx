/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getEligibleKeyringServices,
	isKeyringServicesFetching,
} from 'calypso/state/sharing/services/selectors';
import { getExpandedService } from 'calypso/state/sharing/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Notice from 'calypso/components/notice';
import SectionHeader from 'calypso/components/section-header';
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

const serviceWarningLevelToNoticeStatus = ( level ) => {
	switch ( level ) {
		case 'error':
			return 'is-error';
		case 'warning':
			return 'is-warning';
		case 'info':
		default:
			return 'is-info';
	}
};

const SharingServicesGroup = ( { isFetching, services, title, expandedService } ) => {
	useEffect( () => {
		if ( expandedService && ! isFetching ) {
			const serviceElement = document.querySelector(
				'.sharing-service.' + expandedService.replace( /_/g, '-' )
			);
			if ( serviceElement ) {
				serviceElement.scrollIntoView();
			}
		}
	}, [ expandedService, isFetching ] );

	if ( ! services.length && ! isFetching ) {
		return null;
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="sharing-services-group">
			<SectionHeader label={ title } />
			<ul className="sharing-services-group__services">
				{ services.length
					? services.map( ( service ) => {
							const Component = Components[ service.ID.replace( /-/g, '_' ) ] || Service;

							if ( service.warnings ) {
								return (
									<Fragment key={ service.ID }>
										<Component service={ service } />
										{ service.warnings.map( ( warning, index ) => (
											<Notice
												key={ `warning-${ index }` }
												showDismiss={ false }
												status={ serviceWarningLevelToNoticeStatus( warning.level ) }
											>
												{ warning.message }
											</Notice>
										) ) }
									</Fragment>
								);
							}

							return <Component key={ service.ID } service={ service } />;
					  } )
					: times( NUMBER_OF_PLACEHOLDERS, ( index ) => (
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
	expandedService: PropTypes.string,
};

SharingServicesGroup.defaultProps = {
	isFetching: false,
	services: [],
	expandedService: '',
};

export default connect( ( state, { type } ) => ( {
	isFetching: isKeyringServicesFetching( state ),
	services: getEligibleKeyringServices( state, getSelectedSiteId( state ), type ),
	expandedService: getExpandedService( state ),
} ) )( SharingServicesGroup );
