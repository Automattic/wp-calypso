/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { range } from 'lodash';

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
				{ range( this.props.count ).map( () => (
					<div>
						<SitePlaceholder />
						<PostItem />
					</div>
				) ) }
			</Main>
		);
	}
}
