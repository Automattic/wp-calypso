import { useTranslate } from 'i18n-calypso';
import { times } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getExpandedService } from 'calypso/state/sharing/selectors';
import { requestKeyringServices } from 'calypso/state/sharing/services/actions';
import {
	getEligibleKeyringServices,
	isKeyringServicesFetching,
} from 'calypso/state/sharing/services/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
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
	type,
	isFetching,
	services,
	title,
	expandedService,
	isJetpack,
	isPublicizeActive,
	fetchServices,
	activatePublicize,
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
	const translate = useTranslate();

	const wasPublicizeActiveRef = useRef();
	const wasPublicizeActive = wasPublicizeActiveRef.current;

	// In order to update the UI after activating the Publicize module, we re-fetch the services.
	useEffect( () => {
		wasPublicizeActiveRef.current = isPublicizeActive;

		if ( isFetching ) {
			return;
		}

		if ( isPublicizeActive && ! wasPublicizeActive ) {
			fetchServices();
		}
	}, [ isPublicizeActive, wasPublicizeActive, isFetching, fetchServices ] );

	const showPlaceholder = isFetching;
	const showPublicizeNotice =
		! showPlaceholder && type === 'publicize' && isJetpack && ! isPublicizeActive;
	const showServices = ! showPlaceholder && services.length > 0;

	if ( ! showPlaceholder && ! showPublicizeNotice && ! showServices ) {
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
				{ showPublicizeNotice && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Please enable Jetpack Social to connect your social media accounts and share your posts automatically.'
						) }
					>
						<NoticeAction onClick={ activatePublicize }>{ translate( 'Enable' ) }</NoticeAction>
					</Notice>
				) }
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
							/* Injecting the Fediverse above Twitter */
							if ( service.ID === 'twitter' && type === 'publicize' ) {
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
		siteId,
		isFetching: isKeyringServicesFetching( state ) || isFetchingJetpackModules( state, siteId ),
		services: getEligibleKeyringServices( state, siteId, type ),
		expandedService: getExpandedService( state ),
		isJetpack: isJetpackSite( state, siteId ),
		isPublicizeActive: isJetpackModuleActive( state, siteId, 'publicize', true ),
	};
};

const mapDispatchToProps = {
	fetchServices: requestKeyringServices,
	activateModule,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => ( {
	...ownProps,
	...stateProps,
	...dispatchProps,
	activatePublicize: () => dispatchProps.activateModule( stateProps.siteId, 'publicize' ),
} );

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( SharingServicesGroup );
