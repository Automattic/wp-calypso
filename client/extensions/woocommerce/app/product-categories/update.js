/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEmpty, omit } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { ProtectFormGuard } from 'lib/protect-form';
import { fetchProductCategories } from 'woocommerce/state/sites/product-categories/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	editProductCategory,
	clearProductCategoryEdits,
} from 'woocommerce/state/ui/product-categories/actions';
import {
	getProductCategoryWithLocalEdits,
	getProductCategoryEdits,
} from 'woocommerce/state/ui/product-categories/selectors';
import ProductCategoryForm from './form';
import ProductCategoryHeader from './header';

class ProductCategoryUpdate extends React.Component {
	static propTypes = {
		params: PropTypes.object,
		className: PropTypes.string,
		site: PropTypes.shape( {
			ID: PropTypes.number,
			slug: PropTypes.string,
		} ),
		category: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		fetchProductCategories: PropTypes.func.isRequired,
		editProductCategory: PropTypes.func.isRequired,
		clearProductCategoryEdits: PropTypes.func.isRequired,
	};

	componentDidMount() {
		const { params, site, category } = this.props;
		const categoryId = Number( params.category );

		if ( site && site.ID ) {
			if ( ! category ) {
				this.props.fetchProductCategories( site.ID, { include: [ categoryId ] } );
				this.props.editProductCategory( site.ID, { id: categoryId }, {} );
			}
		}
	}

	componentWillReceiveProps( newProps ) {
		const { params, site } = this.props;
		const categoryId = Number( params.category );
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;
		if ( oldSiteId !== newSiteId ) {
			this.props.fetchProductCategories( newSiteId, { include: [ categoryId ] } );
			this.props.editProductCategory( newSiteId, { id: categoryId }, {} );
		}
	}

	componentWillUnmount() {
		const { site } = this.props;

		if ( site ) {
			this.props.clearProductCategoryEdits( site.ID );
		}
	}

	onTrash = () => {};

	onSave = () => {};

	render() {
		const { site, category, hasEdits, className } = this.props;

		return (
			<Main className={ className } wideLayout>
				<ProductCategoryHeader
					site={ site }
					category={ category }
					onTrash={ this.onTrash }
					onSave={ hasEdits ? this.onSave : false }
				/>
				<ProtectFormGuard isChanged={ hasEdits } />
				<ProductCategoryForm
					siteId={ site && site.ID }
					category={ category || {} }
					editProductCategory={ this.props.editProductCategory }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	const categoryId = Number( ownProps.params.category );

	const site = getSelectedSiteWithFallback( state );
	const category = getProductCategoryWithLocalEdits( state, categoryId );
	const hasEdits = ! isEmpty( omit( getProductCategoryEdits( state, categoryId ), 'id' ) );

	return {
		site,
		category,
		hasEdits,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProductCategory,
			fetchProductCategories,
			clearProductCategoryEdits,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ProductCategoryUpdate ) );
