/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import QueryShortcode from 'components/data/query-shortcode';
import { getShortcode } from 'state/shortcodes/selectors';

/**
 * Local dependencies
 */
import ShortcodeFrame from './frame';

const Shortcode = props => {
	const { siteId, className, children, filterRenderResult, shortcode } = props;
	const classes = classNames( 'shortcode', className );
	let filteredShortcode = {};
	if ( shortcode ) {
		shortcode.body = shortcode.result;
		filteredShortcode = filterRenderResult( omit( shortcode, 'shortcode' ) );
	}
	return (
		<div>
			<QueryShortcode siteId={ siteId } shortcode={ children } />
			<ShortcodeFrame
				{ ...omit( props, 'siteId', 'filterRenderResult', 'shortcode', 'dispatch' ) }
				{ ...filteredShortcode }
				className={ classes }
			/>
		</div>
	);
};

Shortcode.PropTypes = {
	siteId: PropTypes.number.isRequired,
	children: PropTypes.string.isRequired,
	filterRenderResult: PropTypes.func,
	className: PropTypes.string,
};

export default connect(
	( state, { siteId, children } ) => ( {
		shortcode: getShortcode( state, siteId, children ),
	} ),
	null
)( Shortcode );
