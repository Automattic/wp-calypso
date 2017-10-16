/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import { getTopJITM } from 'state/jitm/selectors';
import Banner from 'components/banner';

export const JITM = ( {
	currentSite,
	hasJitm,
	callToAction,
	description,
	featureClass,
	id,
	message,
} ) => ( hasJitm && currentSite ) && (
	<Banner
		callToAction={ callToAction }
		title={ message }
		description={ description }
		disableHref
		dismissPreferenceName={ featureClass + '123' }
		dismissTemporary={ true }
		event={ `jitm_nudge_click_${ id }` }
		href={ `https://jetpack.com/redirect/?source=jitm-${ id }&site=${ currentSite.domain }` }
	/>
);

const mapStateToProps = ( state ) => (
	{
		currentSite: getSelectedSite( state ),
		hasJitm: !! getTopJITM( state ),
		...getTopJITM( state ),
	}
);

export default connect( mapStateToProps )( JITM );
