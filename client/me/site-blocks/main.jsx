/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */

class SiteBlockList extends Component {
	render() {
		const { isLoading } = this.props;
		const containerClasses = classnames( 'site-block-list', 'main', {
			'is-loading': isLoading,
		} );

		return (
			<div className={ containerClasses } role="main">
				Site block list
			</div>
		);
	}
}

export default localize( SiteBlockList );
