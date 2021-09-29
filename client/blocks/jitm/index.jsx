import debugFactory from 'debug';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import QueryJITM from 'calypso/components/data/query-jitm';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { dismissJITM, setupDevTool } from 'calypso/state/jitm/actions';
import { getTopJITM } from 'calypso/state/jitm/selectors';
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
	const { jitm, currentSite, messagePath } = props;
	const tracks = jitm.tracks || {};
	const eventProps = { id: jitm.id, jitm: true, template: jitm?.template ?? 'default' };
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
		tracks.dismiss &&
			props.recordTracksEvent( tracks.dismiss.name, { ...tracks.dismiss.props, ...eventProps } );
		dispatch( dismissJITM( currentSite.ID, messagePath, jitm.featureClass ) );
	};

	handlers.onClick = () => {
		tracks.click &&
			props.recordTracksEvent( tracks.click.name, { ...tracks.click.props, ...eventProps } );

		jitm.action && dispatch( jitm.action );
	};

	return handlers;
}

function useDevTool( { currentSite }, dispatch ) {
	useEffect( () => {
		// Do not setup the tool in production
		if ( process.env.NODE_ENV === 'production' || ! currentSite ) {
			return;
		}

		currentSite.ID && setupDevTool( currentSite.ID, dispatch );
	}, [ currentSite?.ID ] );
}

export function JITM( props ) {
	const { jitm, currentSite, messagePath, isJetpack } = props;
	const dispatch = useDispatch();

	useDevTool( props, dispatch );

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
			<QueryJITM siteId={ currentSite.ID } messagePath={ messagePath } />
			{ jitm &&
				renderTemplate( jitm.template || props.template, {
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
};

JITM.defaultProps = {
	template: 'default',
};

const mapStateToProps = ( state, { messagePath } ) => {
	const currentSite = getSelectedSite( state );
	return {
		currentSite,
		jitm: getTopJITM( state, messagePath ),
		isJetpack: currentSite && isJetpackSite( state, currentSite.ID ),
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( JITM );
