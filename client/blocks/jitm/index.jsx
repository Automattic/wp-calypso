/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import Banner from 'components/banner';

const unescape = ( str ) => {
	return str.replace( /&#(\d+);/g, ( match, entity ) => String.fromCharCode( entity ) );
};

const JITM = ( props ) => {
	if ( props.data.length === 0 || ! props.currentSite ) {
		return null;
	}

	const jitm = props.data[ 0 ];

	return (
		<Banner
			callToAction={ unescape( jitm.CTA.message ) }
			title={ unescape( jitm.content.message ) }
			description={ unescape( jitm.content.description ) }
			disableHref
			dismissPreferenceName={ jitm.id }
			dismissTemporary={ false }
			event={ `jitm_nudge_click_${ jitm.id }` }
			href={ `https://jetpack.com/redirect/?source=jitm-${ jitm.id }&site=${ props.currentSite.domain }` }
		/>
	);
};

const mapStateToProps = ( state ) => (
	{
		currentSite: getSelectedSite( state ),
		data: state.jitm.jitms.data ? state.jitm.jitms.data : [],
	}
);

export default connect( mapStateToProps )( JITM );
