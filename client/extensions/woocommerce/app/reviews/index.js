/**
 * External depedencies
 *
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Main from 'calypso/components/main';
import ReviewsList from './reviews-list';
import StoreDeprecatedNotice from '../../components/store-deprecated-notice';

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
				<ActionHeader breadcrumbs={ <span>{ translate( 'Reviews' ) }</span> } />
				{ config.isEnabled( 'woocommerce/store-deprecated' ) && <StoreDeprecatedNotice /> }
				<ReviewsList
					productId={ params && params.product_id && Number( params.product_id ) }
					currentStatus={ params && params.filter }
				/>
			</Main>
		);
	}
}

export default localize( Reviews );
