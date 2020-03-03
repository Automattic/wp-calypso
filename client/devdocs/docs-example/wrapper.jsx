/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DocsExampleError from 'devdocs/docs-example/error';

const renderTitle = ( unique, name, url ) =>
	unique ? (
		<h2 className="docs-example__wrapper-header-title">{ name }</h2>
	) : (
		<h2 className="docs-example__wrapper-header-title">
			<a href={ url }>{ name }</a>
		</h2>
	);

class DocsExampleWrapper extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		unique: PropTypes.bool,
		url: PropTypes.string.isRequired,
	};

	state = {
		hasError: false,
	};

	componentDidCatch() {
		this.setState( { hasError: true } );
	}

	render() {
		const { children, name, unique, url } = this.props;

		return (
			<div
				className={ classNames( 'docs-example__wrapper', {
					'docs-example__wrapper-unique': unique,
				} ) }
			>
				<div className="docs-example__wrapper-header">{ renderTitle( unique, name, url ) }</div>
				<div className="docs-example__wrapper-content">
					<span className="docs-example__wrapper-content-centering">
						{ this.state.hasError ? <DocsExampleError /> : children }
					</span>
				</div>
			</div>
		);
	}
}

export default DocsExampleWrapper;
