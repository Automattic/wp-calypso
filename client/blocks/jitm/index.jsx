import debugFactory from 'debug';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryJITM from 'calypso/components/data/query-jitm';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { JITM_OPEN_HELP_CENTER } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { dismissJITM, openHelpCenterFromJITM, setupDevTool } from 'calypso/state/jitm/actions';
import { getTopJITM, isFetchingJITM } from 'calypso/state/jitm/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import 'calypso/state/data-layer/wpcom/marketing';

import './style.scss';

const debug = debugFactory( 'calypso:jitm' );

function renderTemplate( template, props ) {
	switch ( template ) {
		case 'notice':
			return (
				<AsyncLoad
					{ ...props }
					require="calypso/blocks/jitm/templates/notice"
					placeholder={ null }
				/>
			);
		case 'sidebar-banner':
			return (
				<AsyncLoad
					{ ...props }
					require="calypso/blocks/jitm/templates/sidebar-banner"
					placeholder={ null }
				/>
			);
		case 'home-task':
			return (
				<AsyncLoad
					{ ...props }
					require="calypso/blocks/jitm/templates/home-task"
					placeholder={ null }
				/>
			);
		case 'spotlight':
			return (
				<AsyncLoad
					{ ...props }
					require="calypso/blocks/jitm/templates/spotlight"
					placeholder={ null }
				/>
			);
		case 'invisible':
			return <>{ props.trackImpression && props.trackImpression() }</>;
		case 'modal':
			return (
				<AsyncLoad
					{ ...props }
					require="calypso/blocks/jitm/templates/modal"
					placeholder={ null }
				/>
			);
		default:
			return (
				<AsyncLoad
					{ ...props }
					require="calypso/blocks/jitm/templates/default"
					placeholder={ null }
				/>
			);
	}
}

function getEventHandlers( props, dispatch ) {
	const { jitm, currentSite, searchQuery, onClick } = props;
	const tracks = jitm.tracks || {};
	const eventProps = {
		id: jitm.id,
		jitm: true,
		template: jitm?.template ?? 'default',
		...( searchQuery && { search_query: searchQuery } ),
	};
	const handlers = {};

	if ( tracks.display ) {
		handlers.trackImpression = () => (
			<TrackComponentView
				eventName={ tracks.display.name || 'calypso_jitm_nudge_impression' }
				eventProperties={ { ...tracks.display.props, ...eventProps } }
			/>
		);
	}

	handlers.onDismiss = () => {
		if ( tracks.dismiss ) {
			dispatch(
				recordTracksEvent( tracks.dismiss.name, { ...tracks.dismiss.props, ...eventProps } )
			);
		}
		dispatch( dismissJITM( currentSite.ID, jitm.id, jitm.featureClass ) );
	};

	handlers.onClick = () => {
		if ( tracks.click ) {
			dispatch( recordTracksEvent( tracks.click.name, { ...tracks.click.props, ...eventProps } ) );
		}
		if ( jitm.action ) {
			switch ( jitm.action.type ) {
				// Cases for dispatching action thunks
				case JITM_OPEN_HELP_CENTER:
					dispatch( openHelpCenterFromJITM( jitm.action.payload ) );
					break;
				default:
					// Dispatch regular actions
					dispatch( jitm.action );
			}
		}

		// Invoke the provided onClick function defined in props
		if ( onClick ) {
			onClick( jitm );
		}
	};

	return handlers;
}

function useDevTool( siteId, dispatch ) {
	useEffect( () => {
		// Do not setup the tool in production
		if ( process.env.NODE_ENV === 'production' || ! siteId ) {
			return;
		}

		setupDevTool( siteId, dispatch );
	}, [ siteId, dispatch ] );
}

export function JITM( props ) {
	const {
		jitm,
		isFetching,
		currentSite,
		messagePath,
		searchQuery,
		isJetpack,
		jitmPlaceholder,
		template,
	} = props;

	const dispatch = useDispatch();

	useDevTool( currentSite?.ID, dispatch );

	if ( ! currentSite || ! messagePath ) {
		return null;
	}

	debug( `siteId: %d, messagePath: %s, message: `, currentSite.ID, messagePath, jitm );
	// 'jetpack' icon is only allowed to Jetpack sites
	if ( jitm?.content?.icon === 'jetpack' && ! isJetpack ) {
		jitm.content.icon = '';
	}

	return (
		<>
			<QueryJITM
				siteId={ currentSite.ID }
				messagePath={ messagePath }
				searchQuery={ searchQuery }
			/>
			{ isFetching && jitmPlaceholder }
			{ jitm &&
				renderTemplate( jitm.template || template || 'default', {
					...jitm,
					...getEventHandlers( props, dispatch ),
					currentSite,
				} ) }
		</>
	);
}

JITM.propTypes = {
	template: PropTypes.string,
	messagePath: PropTypes.string.isRequired,
	searchQuery: PropTypes.string,
	jitmPlaceholder: PropTypes.node,
	isFetching: PropTypes.bool,
};

const mapStateToProps = ( state, { messagePath } ) => {
	const currentSite = getSelectedSite( state );
	return {
		currentSite,
		jitm: getTopJITM( state, messagePath ),
		isFetching: isFetchingJITM( state, messagePath ),
		isJetpack: currentSite && isJetpackSite( state, currentSite.ID ),
	};
};

export default connect( mapStateToProps )( JITM );
