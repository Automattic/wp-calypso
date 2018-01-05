/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

class ProductCategoryForm extends Component {
	static propTypes = {
		className: PropTypes.string,
		siteId: PropTypes.number,
		category: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editProductCategory: PropTypes.func.isRequired,
	};

	setName = e => {
		const { siteId, category, editProductCategory } = this.props;
		const name = e.target.value;
		editProductCategory( siteId, category, { name } );
	};

	renderPlaceholder() {
		const { className } = this.props;
		return (
			<div className={ classNames( 'product-categories__form', 'is-placeholder', className ) }>
				<div />
			</div>
		);
	}

	render() {
		const { siteId, category, translate } = this.props;

		const isCategoryLoaded = category && isNumber( category.id ) ? Boolean( category.slug ) : true;

		if ( ! siteId || ! category || ! isCategoryLoaded ) {
			return this.renderPlaceholder();
		}
		return (
			<div className={ classNames( 'product-categories__form', this.props.className ) }>
				<Card>
					<FormFieldSet>
						<FormLabel htmlFor="name">{ translate( 'Category name' ) }</FormLabel>
						<FormTextInput id="name" value={ category.name || '' } onChange={ this.setName } />
					</FormFieldSet>
				</Card>
			</div>
		);
	}
}

export default localize( ProductCategoryForm );
