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
	static propTypes = {
		count: PropTypes.number.isRequired,
	};

	render() {
		return (
			<Main className="design devdocs-async-load__placeholder">
				{ range( this.props.count ).map( ( element, index ) => (
					<div key={ `devdocs-placeholder-index-${ index }` }>
						<SitePlaceholder />
						<PostItem />
					</div>
				) ) }
			</Main>
		);
	}
}
