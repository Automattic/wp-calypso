/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */

import PrototypeContent from './prototype-content';

export default class extends React.Component {
	static displayName = 'MurielDocument';

	static propTypes = {
		slug: PropTypes.string,
	};

	render() {
		const slug = this.props.slug || '/';

		return (
			<div className="devdocs devdocs__doc">
				<div className="devdocs__body">
					<div className="devdocs__doc-content">
						<PrototypeContent slug={ slug } />
					</div>
				</div>
			</div>
		);
	}
}
