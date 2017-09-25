
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

const renderTitle = ( unique, name, url ) => unique
	? <span className="docs-example__wrapper-header-title">
		{ name }
	</span>
	: <a className="docs-example__wrapper-header-title" href={ url }>
		{ name }
	</a>
;

class DocsExampleWrapper extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		unique: PropTypes.bool,
		url: PropTypes.string.isRequired,
	};

	render() {
		const {
			children,
			name,
			unique,
			url,
		} = this.props;

		return (
			<div className={ classNames(
				'docs-example__wrapper',
				{ 'docs-example__wrapper-unique': unique }
			) }>
				<h2 className="docs-example__wrapper-header">
					{ renderTitle( unique, name, url ) }
				</h2>
				{ children }
			</div>
		);
	}
}

export default DocsExampleWrapper;
