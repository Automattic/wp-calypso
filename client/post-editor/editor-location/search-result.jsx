/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass( {
	displayName: 'EditorLocationSearchResult',

	propTypes: {
		result: PropTypes.object.isRequired,
		onClick: PropTypes.func
	},

	getDefaultProps() {
		return {
			onClick: () => {}
		};
	},

	render() {
		const { result, onClick } = this.props;

		return (
			<div onClick={ onClick } className="editor-location__search-result">
				{ result.formatted_address }
			</div>
		);
	}
} );
