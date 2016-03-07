/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import merge from 'lodash/merge';

/**
 * Internal dependecies
 */
import { getSelectedSite } from 'state/ui/selectors';
import ResizableView from '../../resizable-view';
import ShortcodeUtils from 'lib/shortcode';
import Shortcode from 'components/shortcode';

function VideoView( props ) {
	return (
		<ResizableView className="wpview-content wpview-type-video">
			{ props.siteId && ( <VideoShortcode { ...props } /> ) }
		</ResizableView>
	);
}

VideoView.propTypes = {
	siteId: PropTypes.number,
	content: PropTypes.string
};

function VideoShortcode( { siteId, content, width } ) {
	if ( ! width ) {
		return <div />;
	}

	const shortcode = ShortcodeUtils.stringify( merge( {
		attrs: {
			named: {
				w: width
			}
		}
	}, ShortcodeUtils.parse( content ) ) );

	return (
		<Shortcode
			siteId={ siteId }
			width={ width }>
			{ shortcode }
		</Shortcode>
	);
}

VideoShortcode.propTypes = Object.assign( {}, VideoView.propTypes, {
	width: PropTypes.number
} );

export default connect( ( state ) => {
	return {
		siteId: get( getSelectedSite( state ), 'ID' )
	};
}, null, null, { pure: false } )( VideoView )
