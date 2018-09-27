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

const HOMEPAGE_POST_ID = 38;

export default class extends React.Component {
	static displayName = 'MurielDocument';

	static propTypes = {
		slug: PropTypes.string,
	};

	render() {
		let prototypeContent;

		if ( this.props.slug ) {
			prototypeContent = <PrototypeContent slug={ this.props.slug } />;
		} else {
			prototypeContent = <PrototypeContent id={ HOMEPAGE_POST_ID } />;
		}

		return (
			<div className="devdocs devdocs__doc">
				<div className="devdocs__body">
					<div className="devdocs__doc-content">{ prototypeContent }</div>
				</div>
			</div>
		);
	}
}
