/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { isEmpty, map, some } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FieldError from 'woocommerce/woocommerce-services/components/field-error';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSelect from 'components/forms/form-select';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import ItemInfo from './item-info';
import getBoxDimensions from 'woocommerce/woocommerce-services/lib/utils/get-box-dimensions';
import {
	updatePackageWeight,
	setPackageType,
	openAddItem,
	setPackageSignature,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { getPackageGroupsForLabelPurchase } from 'woocommerce/woocommerce-services/state/packages/selectors';

const renderPackageDimensions = ( dimensions, dimensionUnit ) => {
	return [ dimensions.length, dimensions.width, dimensions.height ]
		.map( ( dimension ) => `${ dimension } ${ dimensionUnit }` )
		.join( ' x ' );
};

const PackageInfo = ( props ) => {
	const {
		siteId,
		orderId,
		packageId,
		selected,
		dimensionUnit,
		weightUnit,
		packageGroups,
		errors,
		translate,
	} = props;

	const pckgErrors = errors[ packageId ] || {};
	if ( ! packageId ) {
		return null;
	}

	const pckg = selected[ packageId ];
	const isIndividualPackage = 'individual' === pckg.box_id;

	const renderItemInfo = ( item, itemIndex ) => {
		return (
			<ItemInfo
				siteId={ siteId }
				orderId={ orderId }
				key={ itemIndex }
				item={ item }
				itemIndex={ itemIndex }
				packageId={ packageId }
				showRemove
				isIndividualPackage={ isIndividualPackage }
			/>
		);
	};

	const renderPackageOption = ( box ) => {
		const dimensions = getBoxDimensions( box );
		const boxId = box.id || box.name;
		return (
			<option value={ boxId } key={ boxId }>
				{ box.name } - { renderPackageDimensions( dimensions, dimensionUnit ) }
			</option>
		);
	};

	const onAddItem = () => props.openAddItem( orderId, siteId );

	const renderAddItemButton = () => {
		if ( isIndividualPackage ) {
			return null;
		}

		return (
			<Button className="packages-step__add-item-btn" compact onClick={ onAddItem }>
				{ translate( 'Add items' ) }
			</Button>
		);
	};

	const packageOptionChange = ( e ) => {
		props.setPackageType( orderId, siteId, packageId, e.target.value );
	};

	const renderItems = () => {
		const canAddItems = some( selected, ( sel, selId ) => packageId !== selId && sel.items.length );

		if ( ! pckg.items.length ) {
			return (
				<div className="packages-step__add-item-row">
					<div className="packages-step__no-items-message">
						{ translate( 'There are no items in this package.' ) }
						{ canAddItems ? renderAddItemButton() : null }
					</div>
				</div>
			);
		}

		const elements = pckg.items.map( renderItemInfo );
		if ( canAddItems ) {
			elements.push(
				<div key={ elements.length } className="packages-step__add-item-row">
					{ renderAddItemButton() }
				</div>
			);
		}

		return elements;
	};

	const renderPackageSelect = () => {
		if ( isIndividualPackage ) {
			const dimensionsClass = classNames( { 'is-error': pckgErrors.dimensions } );
			return (
				<div>
					<div className="packages-step__package-items-header">
						<FormLegend>{ translate( 'Individually Shipped Item' ) }</FormLegend>
					</div>
					<span className="packages-step__package-item-description">
						{ translate( 'Item Dimensions' ) } -{ ' ' }
					</span>
					<span className={ dimensionsClass }>
						{ renderPackageDimensions( pckg, dimensionUnit ) }
					</span>
					{ pckgErrors.dimensions && <FieldError text={ pckgErrors.dimensions } /> }
				</div>
			);
		}

		return (
			<div>
				<div className="packages-step__package-items-header">
					<FormLegend>{ translate( 'Shipping Package' ) }</FormLegend>
				</div>
				<FormSelect
					onChange={ packageOptionChange }
					value={ pckg.box_id }
					isError={ pckgErrors.box_id || pckgErrors.dimensions }
				>
					<option value={ 'not_selected' } key={ 'not_selected' }>
						{ translate( 'Please select a package' ) }
					</option>{ ' ' }
					)
					{ map( packageGroups, ( group, groupId ) => {
						if ( isEmpty( group.definitions ) ) {
							return null;
						}

						return (
							<optgroup label={ group.title } key={ groupId }>
								{ map( group.definitions, renderPackageOption ) }
							</optgroup>
						);
					} ) }
				</FormSelect>
			</div>
		);
	};

	const onWeightChange = ( event ) => {
		props.updatePackageWeight( orderId, siteId, packageId, event.target.value );
	};

	const onSignatureChange = ( event ) => {
		props.setPackageSignature( orderId, siteId, packageId, event.target.value );
	};

	return (
		<div className="packages-step__package">
			{ renderPackageSelect() }

			<div>
				<div className="packages-step__package-items-header">
					<FormLegend>{ translate( 'Items to Ship' ) }</FormLegend>
				</div>
				{ renderItems() }
			</div>

			<div>
				<div className="packages-step__package-weight">
					<FormLabel htmlFor={ `weight_${ packageId }` }>{ translate( 'Total Weight' ) }</FormLabel>
					<FormTextInputWithAffixes
						id={ `weight_${ packageId }` }
						placeholder={ translate( '0' ) }
						value={ pckg.weight || '' }
						onChange={ onWeightChange }
						isError={ Boolean( pckgErrors.weight ) }
						type="number"
						noWrap
						suffix={ weightUnit }
					/>
					{ pckgErrors.weight && <FieldError text={ pckgErrors.weight } /> }
				</div>
				<div className="packages-step__package-signature">
					<FormLabel htmlFor={ `signature_${ packageId }` }>
						{ translate( 'Require Signature', {
							comment: 'Whether or not this package requires a signature during delivery.',
						} ) }
					</FormLabel>
					<FormSelect
						id={ `signature_${ packageId }` }
						value={ pckg.signature || 'no' }
						onChange={ onSignatureChange }
					>
						<option value={ 'no' }>{ translate( 'No' ) }</option> )
						<option value={ 'yes' }>{ translate( 'Yes' ) }</option> )
						<option value={ 'adult' }>
							{ translate( 'Yes, from an adult', {
								comment: 'Package requires signature from an adult during delivery.',
							} ) }
						</option>{ ' ' }
						)
					</FormSelect>
				</div>
			</div>
		</div>
	);
};

PackageInfo.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	packageId: PropTypes.string.isRequired,
	selected: PropTypes.object.isRequired,
	updatePackageWeight: PropTypes.func.isRequired,
	dimensionUnit: PropTypes.string.isRequired,
	weightUnit: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
	setPackageType: PropTypes.func.isRequired,
	openAddItem: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const storeOptions = loaded ? shippingLabel.storeOptions : {};
	const errors = loaded && getFormErrors( state, orderId, siteId ).packages;
	return {
		errors,
		packageId: shippingLabel.openedPackageId,
		selected: shippingLabel.form.packages.selected,
		dimensionUnit: storeOptions.dimension_unit,
		weightUnit: storeOptions.weight_unit,
		packageGroups: getPackageGroupsForLabelPurchase( state, orderId, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators(
		{
			updatePackageWeight,
			setPackageType,
			openAddItem,
			setPackageSignature,
		},
		dispatch
	);
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( PackageInfo ) );
