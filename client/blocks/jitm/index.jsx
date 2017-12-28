/** @format */

/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'client/state/ui/selectors';
import { getTopJITM } from 'client/state/jitm/selectors';
import { dismissJetpackJITM } from 'client/state/jitm/actions';
import Banner from 'client/components/banner';

export const JITM = ( {
	currentSite,
	hasJitm,
	callToAction,
	description,
	featureClass,
	id,
	message,
	onDismiss,
} ) =>
	hasJitm &&
	currentSite && (
		<Banner
			callToAction={ callToAction }
			title={ message }
			description={ description }
			disableHref
			dismissPreferenceName={ featureClass + '123' }
			dismissTemporary={ true }
			onDismiss={ onDismiss( currentSite.ID, id, featureClass ) }
			event={ `jitm_nudge_click_${ id }` }
			href={ `https://jetpack.com/redirect/?source=jitm-${ id }&site=${ currentSite.domain }` }
			target={ '_blank' }
		/>
	);

const mapStateToProps = state => ( {
	currentSite: getSelectedSite( state ),
	hasJitm: !! getTopJITM( state ),
	...getTopJITM( state ),
} );

const mapDispatchToProps = dispatch => ( {
	onDismiss: ( siteId, id, featureClass ) => () =>
		dispatch( dismissJetpackJITM( siteId, id, featureClass ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( JITM );
