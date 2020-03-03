/**
 * External dependencies
 */
import React from 'react';

export default class extends React.Component {
	static displayName = 'PlaceholderLines';

	render() {
		return (
			<ul className="inline-help__results-placeholder">
				<li className="inline-help__results-placeholder-item" />
				<li className="inline-help__results-placeholder-item" />
				<li className="inline-help__results-placeholder-item" />
				<li className="inline-help__results-placeholder-item" />
			</ul>
		);
	}
}
