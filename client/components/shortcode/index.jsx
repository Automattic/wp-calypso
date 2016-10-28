/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import omit from 'lodash/omit';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import QueryShortcode from 'components/data/query-shortcode';
import ShortcodeFrame from './frame';
import { getShortcode } from 'state/shortcodes/selectors';

const Shortcode = React.createClass( {
	propTypes: {
		siteId: PropTypes.number.isRequired,
		children: PropTypes.string.isRequired,
		filterRenderResult: PropTypes.func,
		className: PropTypes.string
	},

	render() {
		const { siteId, className, children, filterRenderResult, shortcode } = this.props;
		const classes = classNames( 'shortcode', className );
		let filteredShortcode = {};
		if ( shortcode ) {
			shortcode.body = shortcode.result;
			filteredShortcode = filterRenderResult( omit( shortcode, 'shortcode' ) );
		}
		return (
			<div>
				<QueryShortcode
					siteId={ siteId }
					shortcode={ children }
				/>
				<ShortcodeFrame
					{ ...omit( this.props, 'siteId', 'filterRenderResult', 'shortcode', 'dispatch' ) }
					{ ...filteredShortcode }
					className={ classes }
				/>
			</div>
		);
	}
} );

export default connect(
	( state, { siteId, children } ) => ( {
		shortcode: getShortcode( state, siteId, children )
	} ),
	null
)( Shortcode );
