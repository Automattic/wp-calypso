import clsx from 'clsx';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import ShortcodeFrame from './frame';

function useRenderedShortcode( siteId, shortcode ) {
	const [ requestState, setRequestState ] = useState( {} );

	useEffect( () => {
		// set the result to `null` and remember what `siteId` and `shortcode` are we requesting
		setRequestState( { siteId, shortcode, result: null } );
		wpcom.req.get( `/sites/${ siteId }/shortcodes/render`, { shortcode } ).then( ( result ) =>
			setRequestState( ( prevState ) => {
				// if the response doesn't match the request, ignore it (race condition)
				if ( prevState.siteId !== siteId || prevState.shortcode !== shortcode ) {
					return prevState;
				}
				// store the matching response into `result`
				return { siteId, shortcode, result };
			} )
		);
	}, [ siteId, shortcode ] );

	return requestState.result;
}

const Shortcode = ( props ) => {
	const { siteId, className, children, filterRenderResult = ( result ) => result } = props;
	const shortcode = useRenderedShortcode( siteId, children );

	const classes = clsx( 'shortcode', className );
	let filteredShortcode = {};
	if ( shortcode ) {
		shortcode.body = shortcode.result;
		filteredShortcode = filterRenderResult( omit( shortcode, 'shortcode' ) );
	}
	return (
		<ShortcodeFrame
			{ ...omit( props, 'siteId', 'filterRenderResult', 'shortcode', 'dispatch' ) }
			{ ...filteredShortcode }
			className={ classes }
		/>
	);
};

Shortcode.propTypes = {
	siteId: PropTypes.number.isRequired,
	children: PropTypes.string.isRequired,
	filterRenderResult: PropTypes.func.isRequired,
	className: PropTypes.string,
	allowSameOrigin: PropTypes.bool,
};

Shortcode.defaultProps = {
	allowSameOrigin: false,
};

export default Shortcode;
