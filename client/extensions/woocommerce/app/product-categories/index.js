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
import ActionHeader from 'client/extensions/woocommerce/components/action-header';
import { getLink } from 'client/extensions/woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'client/extensions/woocommerce/state/sites/selectors';
import Main from 'client/components/main';
import NavTabs from 'client/components/section-nav/tabs';
import NavItem from 'client/components/section-nav/item';
import SectionNav from 'client/components/section-nav';
import Search from 'client/components/search';

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
