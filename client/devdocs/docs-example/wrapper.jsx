
/**
 * External dependencies
 */

import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

class DocsExampleWrapper extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
	};

	render() {
		const {
			children,
			name,
			url,
		} = this.props;

		return (
			<div className={ classNames( 'docs-example__wrapper' ) }>
				<h2 className="docs-example__wrapper-header">
					<a className="docs-example__wrapper-header-title" href={ url }>
						{ name }
					</a>
				</h2>
				{ children }
			</div>
		);
	}
}

export default DocsExampleWrapper;
