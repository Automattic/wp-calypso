/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';

const renderTitle = ( unique, name, url ) =>
	unique ? (
		<h2 className="docs-example__wrapper-header-title">{ name }</h2>
	) : (
		<h2 className="docs-example__wrapper-header-title">
			<a href={ url }>
				{ name }
				<Gridicon icon="link" />
			</a>
		</h2>
	);

class DocsExampleWrapper extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		unique: PropTypes.bool,
		url: PropTypes.string.isRequired,
	};

	render() {
		const { children, name, unique, url } = this.props;

		return (
			<div
				className={ classNames( 'docs-example__wrapper', {
					'docs-example__wrapper-unique': unique,
				} ) }
			>
				<div className="docs-example__wrapper-header">{ renderTitle( unique, name, url ) }</div>
				<div className="docs-examples__wrapper-content">{ children }</div>
			</div>
		);
	}
}

export default DocsExampleWrapper;
