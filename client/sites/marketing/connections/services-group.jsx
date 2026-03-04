import { times } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import { getExpandedService } from 'calypso/state/sharing/selectors';
import {
	getEligibleKeyringServices,
	isKeyringServicesFetching,
} from 'calypso/state/sharing/services/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Service from './service';
import ServicePlaceholder from './service-placeholder';
import * as Components from './services';

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

const SharingServicesGroup = ( {
	isFetching,
	services,
	title,
	expandedService,
	numberOfPlaceholders = NUMBER_OF_PLACEHOLDERS,
} ) => {
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

	const showPlaceholder = isFetching;
	const showServices = ! showPlaceholder && services.length > 0;

	if ( ! showPlaceholder && ! showServices ) {
		return null;
	}

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<PanelCard className="sharing-services-group">
			<PanelCardHeading>{ title }</PanelCardHeading>
			<ul className="sharing-services-group__services">
				{ showPlaceholder &&
					times( numberOfPlaceholders, ( index ) => (
						<ServicePlaceholder key={ 'service-placeholder-' + index } />
					) ) }
				{ showServices &&
					services.map( ( service ) => {
						// eslint-disable-next-line import/namespace
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
						{
							/* Injecting the Fediverse above Google Photos */
							if ( service.ID === 'google_photos' ) {
								return (
									<Fragment key="fediverse">
										<Components.fediverse />
										<Component key={ service.ID } service={ service } />
									</Fragment>
								);
							}
						}
						return <Component key={ service.ID } service={ service } />;
					} ) }
			</ul>
		</PanelCard>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

SharingServicesGroup.propTypes = {
	isFetching: PropTypes.bool,
	services: PropTypes.array,
	title: PropTypes.node.isRequired,
	type: PropTypes.string.isRequired,
	expandedService: PropTypes.string,
};

SharingServicesGroup.defaultProps = {
	isFetching: false,
	services: [],
	expandedService: '',
};

const mapStateToProps = ( state, { type } ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isFetching: isKeyringServicesFetching( state ),
		services: getEligibleKeyringServices( state, siteId, type ),
		expandedService: getExpandedService( state ),
	};
};

export default connect( mapStateToProps )( SharingServicesGroup );
