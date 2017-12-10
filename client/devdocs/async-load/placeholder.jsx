/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import PostItem from 'blocks/post-item';
import SitePlaceholder from 'blocks/site/placeholder';

export default class DevdocsAsyncLoadPlaceholder extends React.PureComponent {
	static displayName = 'DevdocsAsyncLoadPlaceholder';
	static propTypes = {
		count: PropTypes.number.isRequired,
	};

	render() {
		return (
			<Main className="design async-load__devdocs-placeholder">
				{ Array( this.props.count )
					.fill( 1 )
					.map( () => (
						<div>
							<SitePlaceholder />
							<PostItem />
						</div>
					) ) }
			</Main>
		);
	}
}
