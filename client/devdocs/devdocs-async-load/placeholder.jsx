/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { range } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import SitePlaceholder from 'calypso/blocks/site/placeholder';

export default class DevdocsAsyncLoadPlaceholder extends React.PureComponent {
	static propTypes = {
		count: PropTypes.number.isRequired,
	};

	render() {
		return (
			<Main className="devdocs devdocs-async-load__placeholder">
				{ range( this.props.count ).map( ( element, index ) => (
					<div key={ `devdocs-placeholder-index-${ index }` }>
						<SitePlaceholder />
					</div>
				) ) }
			</Main>
		);
	}
}
