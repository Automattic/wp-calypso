/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import ItemInfo from './item-info';
import NumberField from 'woocommerce/woocommerce-services/components/number-field';
import FormLegend from 'components/forms/form-legend';
import FormSelect from 'components/forms/form-select';
import Button from 'components/button';
import getBoxDimensions from 'woocommerce/woocommerce-services/lib/utils/get-box-dimensions';
import { getFormErrors } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import {
	updateWeight,
	removePackage,
	setPackageType,
	openAddItem,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const renderPackageDimensions = ( dimensions, dimensionUnit ) => {
	return `${ dimensions.length } ${ dimensionUnit } x
			${ dimensions.width } ${ dimensionUnit } x
			${ dimensions.height } ${ dimensionUnit }`;
};

const PackageInfo = ( props ) => {
	const {
		packageId,
		selected,
		all,
		flatRateGroups,
		dimensionUnit,
		weightUnit,
		errors,
	} = props;

	const pckgErrors = errors[ packageId ] || {};
	if ( ! packageId ) {
		return null;
	}

	const pckg = selected[ packageId ];
	const isIndividualPackage = ! ( 'not_selected' === pckg.box_id || all[ pckg.box_id ] );

	const renderItemInfo = ( item, itemIndex ) => {
		return (
			<ItemInfo key={ itemIndex }
					item={ item }
					itemIndex={ itemIndex }
					packageId={ packageId }
					showRemove
					isIndividualPackage={ isIndividualPackage } />
		);
	};

	const renderPackageOption = ( box, boxId ) => {
		const dimensions = getBoxDimensions( box );
		return ( <option value={ boxId } key={ boxId }>{ box.name } - { renderPackageDimensions( dimensions, dimensionUnit ) }</option> );
	};

	const renderAddItemButton = () => {
		if ( isIndividualPackage ) {
			return null;
		}

		return ( <Button className="packages-step__add-item-btn" compact onClick={ props.openAddItem }>{ __( 'Add items' ) }</Button> );
	};

	const packageOptionChange = ( e ) => {
		props.setPackageType( packageId, e.target.value );
	};

	const renderItems = () => {
		const canAddItems = _.some( selected, ( sel, selId ) => ( packageId !== selId && sel.items.length ) );

		if ( ! pckg.items.length ) {
			return (
				<div className="packages-step__add-item-row">
					<div className="packages-step__no-items-message">
						{ __( 'There are no items in this package.' ) }
						{ canAddItems ? renderAddItemButton() : null }
					</div>
				</div>
			);
		}

		const elements = pckg.items.map( renderItemInfo );
		if ( canAddItems ) {
			elements.push( <div key={ elements.length } className="packages-step__add-item-row">
				{ renderAddItemButton() }
			</div> );
		}

		return elements;
	};

	const renderPackageSelect = () => {
		if ( isIndividualPackage ) {
			return ( <div>
				<div className="packages-step__package-items-header">
					<FormLegend>{ __( 'Individually Shipped Item' ) }</FormLegend>
				</div>
				<span className="packages-step__package-item-description">{ __( 'Item Dimensions' ) } - </span>
				<span>{ renderPackageDimensions( pckg, dimensionUnit ) }</span>
			</div> );
		}

		const groups = _.reduce( flatRateGroups, ( result, groupTitle, groupId ) => {
			const definitions = _.pickBy( all, { group_id: groupId } );
			if ( _.isEmpty( definitions ) ) {
				return result;
			}

			result[ groupId ] = { title: groupTitle, definitions };
			return result;
		}, {
			custom: { title: __( 'Custom Packages' ), definitions: _.pickBy( all, p => ! p.group_id ) },
		} );

		return (
			<div>
				<div className="packages-step__package-items-header">
					<FormLegend>{ __( 'Shipping Package' ) }</FormLegend>
				</div>
				<FormSelect onChange={ packageOptionChange } value={ pckg.box_id } isError={ pckgErrors.box_id }>
					<option value={ 'not_selected' } key={ 'not_selected' }>{ __( 'Please select a package' ) }</option> )
					{ _.map( groups, ( group, groupId ) => {
						if ( _.isEmpty( group.definitions ) ) {
							return null;
						}

						return <optgroup label={ group.title } key={ groupId }>
							{ _.map( group.definitions, renderPackageOption ) }
						</optgroup>;
					} ) }
				</FormSelect>
			</div>
		);
	};

	const onWeightChange = ( value ) => props.updateWeight( packageId, value );

	return (
		<div className="packages-step__package">
			{ renderPackageSelect() }

			<div>
				<div className="packages-step__package-items-header">
					<FormLegend>{ __( 'Items to Ship' ) }</FormLegend>
				</div>
				{ renderItems() }
			</div>

			<div>
				<NumberField
					id={ `weight_${ packageId }` }
					className="packages-step__package-weight"
					title={ __( 'Total Weight' ) }
					value={ pckg.weight }
					updateValue={ onWeightChange }
					error={ pckgErrors.weight } />
				<span className="packages-step__package-weight-unit">{ weightUnit }</span>
			</div>
		</div>
	);
};

PackageInfo.propTypes = {
	packageId: PropTypes.string.isRequired,
	selected: PropTypes.object.isRequired,
	all: PropTypes.object.isRequired,
	flatRateGroups: PropTypes.object.isRequired,
	updateWeight: PropTypes.func.isRequired,
	dimensionUnit: PropTypes.string.isRequired,
	weightUnit: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
	setPackageType: PropTypes.func.isRequired,
	openAddItem: PropTypes.func.isRequired,
};

const mapStateToProps = ( state ) => {
	const loaded = state.shippingLabel.loaded;
	const storeOptions = loaded ? state.shippingLabel.storeOptions : {};
	const errors = loaded && getFormErrors( state, storeOptions ).packages;
	return {
		errors,
		packageId: state.shippingLabel.openedPackageId,
		selected: state.shippingLabel.form.packages.selected,
		all: state.shippingLabel.form.packages.all,
		flatRateGroups: state.shippingLabel.form.packages.flatRateGroups,
		dimensionUnit: storeOptions.dimension_unit,
		weightUnit: storeOptions.weight_unit,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( {
		updateWeight,
		removePackage,
		setPackageType,
		openAddItem,
	}, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( PackageInfo );
