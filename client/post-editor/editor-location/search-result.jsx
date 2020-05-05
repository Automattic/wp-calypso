/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

export default class extends React.Component {
	static displayName = 'EditorLocationSearchResult';

	static propTypes = {
		result: PropTypes.object.isRequired,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		onClick: () => {},
	};

	render() {
		const { result, onClick } = this.props;

		return (
			<div onClick={ onClick } className="editor-location__search-result">
				{ result.formatted_address }
			</div>
		);
	}
}
