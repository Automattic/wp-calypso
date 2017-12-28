/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { omit } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ShortcodesStore from 'client/lib/shortcodes/store';
import * as ShortcodesActions from 'client/lib/shortcodes/actions';

/**
 * Local dependencies
 */
import ShortcodeData from './data';
import ShortcodeFrame from './frame';

export default class Shortcode extends React.Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		children: PropTypes.string.isRequired,
		filterRenderResult: PropTypes.func,
		className: PropTypes.string,
	};

	componentDidMount() {
		this.fetchRendered();
		this.listener = ShortcodesStore.addListener( this.fetchRendered );
	}

	componentDidUpdate() {
		this.fetchRendered();
	}

	componentWillUnmount() {
		this.clearFetchTimeout();

		if ( this.listener ) {
			this.listener.remove();
		}
	}

	fetchRendered = () => {
		const { siteId, children: shortcode } = this.props;

		if ( ShortcodesStore.get( siteId, shortcode ) ) {
			return;
		}

		this.clearFetchTimeout();
		this.fetchTimeout = setTimeout( () => {
			this.clearFetchTimeout();
			ShortcodesActions.fetch( siteId, shortcode );
		}, 0 );
	};

	clearFetchTimeout = () => {
		clearTimeout( this.fetchTimeout );
		this.fetchTimeout = null;
	};

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
}
