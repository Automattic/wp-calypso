/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormRadio from 'components/forms/form-radio';
import FormLabel from 'components/forms/form-label';
import ActionButtons from 'components/action-buttons';
import getPackageDescriptions from './get-package-descriptions';
import FormSectionHeading from 'components/forms/form-section-heading';

const MoveItemDialog = ( {
	showItemMoveDialog,
	movedItemIndex,
	targetPackageId,
	openedPackageId,
	selected,
	all,
	closeItemMove,
	setTargetPackage,
	moveItem } ) => {
	if ( -1 === movedItemIndex || ! showItemMoveDialog ) {
		return null;
	}

	const renderRadioButton = ( pckgId, label ) => {
		const onChange = () => setTargetPackage( pckgId );
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
				onClickOutside={ closeItemMove }
				onClose={ closeItemMove }
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
					onClick: () => moveItem( openedPackageId, movedItemIndex, targetPackageId ),
				},
				{ label: __( 'Cancel' ), onClick: closeItemMove },
			] } />
		</Dialog>
	);
};

MoveItemDialog.propTypes = {
	showItemMoveDialog: PropTypes.bool.isRequired,
	movedItemIndex: PropTypes.number.isRequired,
	targetPackageId: PropTypes.string,
	openedPackageId: PropTypes.string.isRequired,
	selected: PropTypes.object.isRequired,
	all: PropTypes.object.isRequired,
	moveItem: PropTypes.func.isRequired,
};

export default MoveItemDialog;
