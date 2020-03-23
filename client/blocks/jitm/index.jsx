/**
 * External Dependencies
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getTopJITM } from 'state/jitm/selectors';
import { dismissJITM, setupDevTool } from 'state/jitm/actions';
import AsyncLoad from 'components/async-load';
import QueryJITM from 'components/data/query-jitm';
import 'state/data-layer/wpcom/marketing';

const debug = debugFactory( 'calypso:jitm' );

function renderTemplate( template, props ) {
	if ( template === 'notice' ) {
		return <AsyncLoad { ...props } require="blocks/jitm/templates/notice" />;
	}

	if ( template === 'sidebar-banner' ) {
		return <AsyncLoad { ...props } require="blocks/jitm/templates/sidebar-banner" />;
	}

	return <AsyncLoad { ...props } require="blocks/jitm/templates/default" />;
}

function getEventHandlers( props, dispatch ) {
	const { jitm, currentSite, messagePath } = props;
	const tracks = jitm.tracks || {};
	const eventProps = { id: jitm.id, jitm: true };
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

const mapStateToProps = ( state, ownProps ) => {
	const currentSite = getSelectedSite( state );

	return {
		currentSite,
		jitm: getTopJITM( state, ownProps.messagePath ),
		isJetpack: currentSite && isJetpackSite( state, currentSite.ID ),
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( JITM );
