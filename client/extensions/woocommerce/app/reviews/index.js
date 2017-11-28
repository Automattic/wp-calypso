/**
 * External depedencies
 *
 * @format
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ReviewsList from './reviews-list';

class Reviews extends Component {
	static propTypes = {
		params: PropTypes.shape( {
			filter: PropTypes.string,
			productId: PropTypes.string,
		} ),
		className: PropTypes.string,
	};

	render() {
		const { className, translate, params } = this.props;
		const classes = classNames( 'reviews__list', className );

		return (
			<Main className={ classes } wideLayout>
				<SidebarNavigation />
				<ActionHeader breadcrumbs={ <span>{ translate( 'Reviews' ) }</span> } />
				<ReviewsList
					productId={ params && params.productId && Number( params.productId ) }
					currentStatus={ params && params.filter }
				/>
			</Main>
		);
	}
}

export default localize( Reviews );
