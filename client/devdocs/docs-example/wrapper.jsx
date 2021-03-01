/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DocsExampleError from 'calypso/devdocs/docs-example/error';

const renderTitle = ( unique, name, url, onTitleClick ) =>
	unique ? (
		<h2 className="docs-example__wrapper-header-title">{ name }</h2>
	) : (
		<h2 className="docs-example__wrapper-header-title">
			<a href={ url } onClick={ onTitleClick } onKeyPress={ onTitleClick }>
				{ name }
			</a>
		</h2>
	);

class DocsExampleWrapper extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		unique: PropTypes.bool,
		url: PropTypes.string.isRequired,
		onTitleClick: PropTypes.func,
	};

	state = {
		hasError: false,
	};

	componentDidCatch() {
		this.setState( { hasError: true } );
	}

	render() {
		const { children, name, unique, url, onTitleClick } = this.props;

		return (
			<div
				className={ classNames( 'docs-example__wrapper', {
					'docs-example__wrapper-unique': unique,
				} ) }
			>
				<div className="docs-example__wrapper-header">
					{ renderTitle( unique, name, url, onTitleClick ) }
				</div>
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
