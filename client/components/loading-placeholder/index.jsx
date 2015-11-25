/**
 * External dependencies
 */
import classnames from 'classnames';
import noop from 'lodash/utility/noop';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Main from 'components/main';

const LoadingPlaceholder = React.createClass( {
	propTypes: {
		className: React.PropTypes.string
	},

	goBack() {
		page.back( '/' );
	},

	render() {
		return (
			<Main className={ classnames( 'loading-placeholder', this.props.className ) }>
				<HeaderCake className="loading-placeholder__header" onClick={ this.goBack } />

				{ this.props.children }
			</Main>
		);
	}
} );

export default LoadingPlaceholder;
