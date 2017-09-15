import page from 'page';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Main from 'components/main';

const LoadingPlaceholder = React.createClass( {
	propTypes: {
		path: PropTypes.string,
		title: PropTypes.string.isRequired,
	},

	goBack() {
		page.back( this.props.path || '/' );
	},

	render() {
		return (
			<Main className="loading-placeholder">
				<HeaderCake className="loading-placeholder__header" onClick={ this.goBack }>
					{ this.props.title }
				</HeaderCake>

				{ this.props.children }
			</Main>
		);
	},
} );

export default LoadingPlaceholder;
