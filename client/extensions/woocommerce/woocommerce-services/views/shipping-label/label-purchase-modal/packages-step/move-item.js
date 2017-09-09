/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormRadio from 'components/forms/form-radio';
import FormLabel from 'components/forms/form-label';
import ActionButtons from 'woocommerce/woocommerce-services/components/action-buttons';
import getPackageDescriptions from './get-package-descriptions';
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeItemMove, setTargetPackage, moveItem } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const MoveItemDialog = ( props ) => {
	const {
		showItemMoveDialog,
		movedItemIndex,
		targetPackageId,
		openedPackageId,
		selected,
		all,
	} = props;

	if ( -1 === movedItemIndex || ! showItemMoveDialog ) {
		return null;
	}

	const renderRadioButton = ( pckgId, label ) => {
		const onChange = () => props.setTargetPackage( pckgId );
		return (
			<FormLabel
				key={ pckgId }
				className="packages-step__dialog-package-option">
				<FormRadio checked={ pckgId === targetPackageId } onChange={ onChange } />
				{ label }
			</FormLabel>
		);
	};

	const openedPackage = selected[ openedPackageId ];
	const items = openedPackage.items;
	const item = items[ movedItemIndex ];
	const itemLink = <a href={ item.url } target="_blank" rel="noopener noreferrer">{ item.name }</a>;
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
		return renderRadioButton( 'new', __( 'Add to a New Package' ) );
	};

	const renderIndividualOption = () => {
		if ( openedPackage && 'individual' === openedPackage.box_id ) {
			return null;
		}

		return renderRadioButton( 'individual', __( 'Ship in original packaging' ) );
	};

	if ( '' === openedPackageId ) {
		desc = __( '{{itemLink/}} is currently saved for a later shipment.', { components: { itemLink } } );
	} else if ( 'individual' === openedPackage.box_id ) {
		desc = __( '{{itemLink/}} is currently shipped in its original packaging.', { components: { itemLink } } );
	} else {
		desc = __(
			'{{itemLink/}} is currently in {{pckg/}}.',
			{
				components: {
					itemLink,
					pckg: <span className="packages-step__dialog-package-name">{ packageLabels[ openedPackageId ] }</span>,
				},
			}
		);
	}

	return (
		<Dialog isVisible={ showItemMoveDialog }
				isFullScreen={ false }
				onClickOutside={ props.closeItemMove }
				onClose={ props.closeItemMove }
				additionalClassNames="wcc-root packages-step__dialog" >
			<FormSectionHeading>{ __( 'Move item' ) }</FormSectionHeading>
			<div className="packages-step__dialog-body">
				<p>{ desc }</p>
				<p>{ __( 'Where would you like to move it?' ) }</p>
				{ renderPackedOptions() }
				{ renderNewPackageOption() }
				{ renderIndividualOption() }
			</div>
			<ActionButtons buttons={ [
				{
					label: __( 'Move' ),
					isPrimary: true,
					isDisabled: targetPackageId === openedPackageId,  // Result of targetPackageId initialization
					onClick: () => props.moveItem( openedPackageId, movedItemIndex, targetPackageId ),
				},
				{ label: __( 'Cancel' ), onClick: props.closeItemMove },
			] } />
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

const mapStateToProps = ( state ) => {
	return {
		showItemMoveDialog: state.shippingLabel.showItemMoveDialog || false,
		movedItemIndex: isNaN( state.shippingLabel.movedItemIndex ) ? -1 : state.shippingLabel.movedItemIndex,
		targetPackageId: state.shippingLabel.targetPackageId,
		openedPackageId: state.shippingLabel.openedPackageId,
		selected: state.shippingLabel.form.packages.selected,
		all: state.shippingLabel.form.packages.all,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeItemMove, setTargetPackage, moveItem }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( MoveItemDialog );
