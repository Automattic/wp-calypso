/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import SectionNav from 'components/section-nav';
import Search from 'components/search';

class ProductCategories extends Component {

	render() {
		const { className, translate, site } = this.props;
		const classes = classNames( 'product_categories__list', className );

		const productsLabel = translate( 'Products' );
		const categoriesLabel = translate( 'Categories' );

		return (
			<Main className={ classes } wideLayout>
				<ActionHeader breadcrumbs={ [
					<a href={ getLink( '/store/products/:site/', site ) }>{ productsLabel }</a>,
					<span>{ categoriesLabel }</span>,
				] }>
				</ActionHeader>
				<SectionNav>
					<NavTabs label={ translate( 'Products' ) } selectedText={ categoriesLabel }>
						<NavItem path={ getLink( '/store/products/:site/', site ) }>{ productsLabel }</NavItem>
						<NavItem path={ getLink( '/store/products/categories/:site/', site ) } selected>
							{ categoriesLabel }
						</NavItem>
					</NavTabs>

					<Search
						pinned
						fitsContainer
						placeholder={ translate( 'Search categories…' ) }
					/>
				</SectionNav>
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
}

export default connect( mapStateToProps )( localize( ProductCategories ) );
