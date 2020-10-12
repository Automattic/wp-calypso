/**
 * External dependencies
 */

import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';

/**
 * Style dependencies
 */
import './style.scss';

class LoadingPlaceholder extends React.Component {
	static propTypes = {
		path: PropTypes.string,
		title: PropTypes.string.isRequired,
		isFullWidth: PropTypes.bool.isRequired,
	};

	goBack = () => {
		page.back( this.props.path || '/' );
	};

	render() {
		const classes = classnames( 'loading-placeholder', {
			'is-wide-layout': this.props.isFullWidth,
		} );

		return (
			<Main className={ classes }>
				<HeaderCake className="loading-placeholder__header" onClick={ this.goBack }>
					{ this.props.title }
				</HeaderCake>

				{ this.props.children }
			</Main>
		);
	}
}

export default LoadingPlaceholder;
