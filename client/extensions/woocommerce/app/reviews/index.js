/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ReviewsList from './reviews-list';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ActionHeader from 'woocommerce/components/action-header';

class Reviews extends Component {
	static propTypes = {
		params: PropTypes.shape( {
			filter: PropTypes.string,
		} ),
		className: PropTypes.string,
	};

	render() {
		const { className, translate, params } = this.props;
		const classes = classNames( 'reviews__list', className );

		return (
			<Main className={ classes }>
				<SidebarNavigation />
				<ActionHeader breadcrumbs={ ( <span>{ translate( 'Reviews' ) }</span> ) } />
				<ReviewsList currentStatus={ params && params.filter } />
			</Main>
		);
	}
}

export default localize( Reviews );
