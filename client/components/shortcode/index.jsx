/**
 * External dependencies
 */
import classNames from 'classnames';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ShortcodeData from './data';
import ShortcodeFrame from './frame';
import * as ShortcodesActions from 'lib/shortcodes/actions';
import ShortcodesStore from 'lib/shortcodes/store';

export default React.createClass( {
	displayName: 'Shortcode',

	propTypes: {
		siteId: PropTypes.number.isRequired,
		children: PropTypes.string.isRequired,
		filterRenderResult: PropTypes.func,
		className: PropTypes.string
	},

	componentDidMount() {
		this.fetchRendered();
		this.listener = ShortcodesStore.addListener( this.fetchRendered );
	},

	componentDidUpdate() {
		this.fetchRendered();
	},

	componentWillUnmount() {
		this.clearFetchTimeout();

		if ( this.listener ) {
			this.listener.remove();
		}
	},

	fetchRendered() {
		const { siteId, children: shortcode } = this.props;

		if ( ShortcodesStore.get( siteId, shortcode ) ) {
			return;
		}

		this.clearFetchTimeout();
		this.fetchTimeout = setTimeout( () => {
			this.clearFetchTimeout();
			ShortcodesActions.fetch( siteId, shortcode );
		}, 0 );
	},

	clearFetchTimeout() {
		clearTimeout( this.fetchTimeout );
		this.fetchTimeout = null;
	},

	render() {
		const { siteId, className, filterRenderResult, children } = this.props;
		const classes = classNames( 'shortcode', className );

		return (
			<ShortcodeData
				siteId={ siteId }
				shortcode={ children }
				filterRenderResult={ filterRenderResult }
			>
				<ShortcodeFrame
					{ ...omit( this.props, 'siteId', 'filterRenderResult' ) }
					className={ classes }
				/>
			</ShortcodeData>
		);
	}
} );
