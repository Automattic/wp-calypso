/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { includes, size, some } from 'lodash';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import getPackageDescriptions from './get-package-descriptions';
import FormSectionHeading from 'components/forms/form-section-heading';
import {
	closeAddItem,
	setAddedItem,
	addItems,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { getAllPackageDefinitions } from 'woocommerce/woocommerce-services/state/packages/selectors';

const AddItemDialog = ( props ) => {
	const {
		siteId,
		orderId,
		showAddItemDialog,
		addedItems,
		openedPackageId,
		selected,
		all,
		translate,
	} = props;

	if ( ! showAddItemDialog ) {
		return null;
	}

	const packageLabels = getPackageDescriptions( selected, all, true );
	const getPackageNameElement = ( pckgId ) => {
		return <span className="packages-step__dialog-package-name">{ packageLabels[ pckgId ] }</span>;
	};

	const renderCheckbox = ( pckgId, itemIdx, item ) => {
		const itemLabel = packageLabels[ pckgId ]
			? translate( '%(item)s from {{pckg/}}', {
					args: { item: item.name },
					components: { pckg: getPackageNameElement( pckgId ) },
			  } )
			: item;

		const onChange = ( event ) =>
			props.setAddedItem( orderId, siteId, pckgId, itemIdx, event.target.checked );
		return (
			<FormLabel
				key={ `${ pckgId }-${ itemIdx }` }
				className="packages-step__dialog-package-option"
			>
				<FormCheckbox checked={ includes( addedItems[ pckgId ], itemIdx ) } onChange={ onChange } />
				<span>{ itemLabel }</span>
			</FormLabel>
		);
	};

	const itemOptions = [];
	Object.keys( selected ).forEach( ( pckgId ) => {
		if ( pckgId === openedPackageId ) {
			return;
		}

		let itemIdx = 0;
		selected[ pckgId ].items.forEach( ( item ) => {
			itemOptions.push( renderCheckbox( pckgId, itemIdx, item ) );
			itemIdx++;
		} );
	} );

	const onClose = () => props.closeAddItem( orderId, siteId );

	const buttons = [
		{ action: 'close', label: translate( 'Close' ), onClick: onClose },
		{
			action: 'add',
			label: translate( 'Add' ),
			isPrimary: true,
			disabled: ! some( addedItems, size ),
			onClick: () => props.addItems( orderId, siteId, openedPackageId ),
		},
	];

	return (
		<Dialog
			isVisible={ showAddItemDialog }
			isFullScreen={ false }
			onClickOutside={ onClose }
			onClose={ onClose }
			buttons={ buttons }
			additionalClassNames="wcc-root woocommerce packages-step__dialog"
		>
			<FormSectionHeading>{ translate( 'Add item' ) }</FormSectionHeading>
			<div className="packages-step__dialog-body">
				<p>
					{ translate( 'Which items would you like to add to {{pckg/}}?', {
						components: {
							pckg: getPackageNameElement( openedPackageId ),
						},
					} ) }
				</p>
				{ itemOptions }
			</div>
		</Dialog>
	);
};

AddItemDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	showAddItemDialog: PropTypes.bool.isRequired,
	addedItems: PropTypes.object,
	openedPackageId: PropTypes.string.isRequired,
	selected: PropTypes.object.isRequired,
	all: PropTypes.object.isRequired,
	closeAddItem: PropTypes.func.isRequired,
	setAddedItem: PropTypes.func.isRequired,
	addItems: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return {
		showAddItemDialog: Boolean( shippingLabel.showAddItemDialog ),
		addedItems: shippingLabel.addedItems,
		openedPackageId: shippingLabel.openedPackageId,
		selected: shippingLabel.form.packages.selected,
		all: getAllPackageDefinitions( state, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeAddItem, setAddedItem, addItems }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AddItemDialog ) );
