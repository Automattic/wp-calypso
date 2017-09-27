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

const JITM = ( props ) => {
	if ( ! props.jitm || ! props.currentSite ) {
		return null;
	}

	const jitm = props.jitm;

	return (
		<Banner
			callToAction={ jitm.CTA.message }
			title={ jitm.content.message }
			description={ jitm.content.description }
			disableHref
			dismissPreferenceName={ jitm.id + '123' }
			dismissTemporary={ false }
			event={ `jitm_nudge_click_${ jitm.id }` }
			href={ `https://jetpack.com/redirect/?source=jitm-${ jitm.id }&site=${ props.currentSite.domain }` }
		/>
	);
};

const mapStateToProps = ( state ) => (
	{
		currentSite: getSelectedSite( state ),
		jitm: getTopJITM( state ),
	}
);

export default connect( mapStateToProps )( JITM );
