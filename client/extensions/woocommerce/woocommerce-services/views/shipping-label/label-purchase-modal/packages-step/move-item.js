/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormRadio from 'components/forms/form-radio';
import FormLabel from 'components/forms/form-label';
import getPackageDescriptions from './get-package-descriptions';
import FormSectionHeading from 'components/forms/form-section-heading';
import getProductLink from 'woocommerce/woocommerce-services/lib/utils/get-product-link';
import { getSite } from 'state/sites/selectors';
import {
	closeItemMove,
	setTargetPackage,
	moveItem,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { getAllPackageDefinitions } from 'woocommerce/woocommerce-services/state/packages/selectors';

const MoveItemDialog = ( props ) => {
	const {
		site,
		siteId,
		orderId,
		showItemMoveDialog,
		movedItemIndex,
		targetPackageId,
		openedPackageId,
		selected,
		all,
		translate,
	} = props;

	if ( -1 === movedItemIndex || ! showItemMoveDialog ) {
		return null;
	}

	const renderRadioButton = ( pckgId, label ) => {
		const onChange = () => props.setTargetPackage( orderId, siteId, pckgId );
		return (
			<FormLabel key={ pckgId } className="packages-step__dialog-package-option">
				<FormRadio checked={ pckgId === targetPackageId } onChange={ onChange } />
				{ label }
			</FormLabel>
		);
	};

	const openedPackage = selected[ openedPackageId ];
	const items = openedPackage.items;
	const item = items[ movedItemIndex ];
	const itemUrl = getProductLink( item.product_id, site );
	const itemLink = (
		<a href={ itemUrl } target="_blank" rel="noopener noreferrer">
			{ item.name }
		</a>
	);
	let desc;

	const packageLabels = getPackageDescriptions( selected, all, true );

	const renderPackedOptions = () => {
		const elements = [];
		Object.keys( selected ).forEach( ( pckgId ) => {
			const pckg = selected[ pckgId ];
			if ( pckgId === openedPackageId || 'individual' === pckg.box_id ) {
				return;
			}

			elements.push( renderRadioButton( pckgId, packageLabels[ pckgId ] ) );
		} );

		return elements;
	};

	const renderNewPackageOption = () => {
		return renderRadioButton( 'new', translate( 'Add to a New Package' ) );
	};

	const renderIndividualOption = () => {
		if ( openedPackage && 'individual' === openedPackage.box_id ) {
			return null;
		}

		return renderRadioButton( 'individual', translate( 'Ship in original packaging' ) );
	};

	if ( '' === openedPackageId ) {
		desc = translate( '{{itemLink/}} is currently saved for a later shipment.', {
			components: { itemLink },
		} );
	} else if ( 'individual' === openedPackage.box_id ) {
		desc = translate( '{{itemLink/}} is currently shipped in its original packaging.', {
			components: { itemLink },
		} );
	} else {
		desc = translate( '{{itemLink/}} is currently in {{pckg/}}.', {
			components: {
				itemLink,
				pckg: (
					<span className="packages-step__dialog-package-name">
						{ packageLabels[ openedPackageId ] }
					</span>
				),
			},
		} );
	}

	const onClose = () => props.closeItemMove( orderId, siteId );

	const buttons = [
		{ action: 'cancel', label: translate( 'Cancel' ), onClick: onClose },
		{
			action: 'move',
			label: translate( 'Move' ),
			isPrimary: true,
			disabled: targetPackageId === openedPackageId, // Result of targetPackageId initialization
			onClick: () =>
				props.moveItem( orderId, siteId, openedPackageId, movedItemIndex, targetPackageId ),
		},
	];

	return (
		<Dialog
			isVisible={ showItemMoveDialog }
			isFullScreen={ false }
			onClickOutside={ onClose }
			onClose={ onClose }
			buttons={ buttons }
			additionalClassNames="wcc-root woocommerce packages-step__dialog"
		>
			<FormSectionHeading>{ translate( 'Move item' ) }</FormSectionHeading>
			<div className="packages-step__dialog-body">
				<p>{ desc }</p>
				<p>{ translate( 'Where would you like to move it?' ) }</p>
				{ renderPackedOptions() }
				{ renderNewPackageOption() }
				{ renderIndividualOption() }
			</div>
		</Dialog>
	);
};

MoveItemDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	showItemMoveDialog: PropTypes.bool.isRequired,
	movedItemIndex: PropTypes.number.isRequired,
	targetPackageId: PropTypes.string,
	openedPackageId: PropTypes.string.isRequired,
	selected: PropTypes.object.isRequired,
	all: PropTypes.object.isRequired,
	moveItem: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const site = getSite( state, siteId );
	return {
		site,
		showItemMoveDialog: shippingLabel.showItemMoveDialog || false,
		movedItemIndex: isNaN( shippingLabel.movedItemIndex ) ? -1 : shippingLabel.movedItemIndex,
		targetPackageId: shippingLabel.targetPackageId,
		openedPackageId: shippingLabel.openedPackageId,
		selected: shippingLabel.form.packages.selected,
		all: getAllPackageDefinitions( state, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeItemMove, setTargetPackage, moveItem }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( MoveItemDialog ) );
