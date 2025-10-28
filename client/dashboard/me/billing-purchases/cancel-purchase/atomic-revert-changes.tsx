import { CheckboxControl, Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { intlFormat } from 'date-fns';
import { useState } from 'react';
import type { AtomicTransfer, Purchase } from '@automattic/api-core';
import './style.scss';

type AtomicRevertChangesProps = {
	atomicTransfer?: AtomicTransfer;
	purchase: Purchase;
	onConfirmationChange: ( isChecked: boolean ) => void;
	needsAtomicRevertConfirmation: boolean;
	isLoading?: boolean;
};

const AtomicRevertChanges = ( {
	atomicTransfer,
	purchase,
	onConfirmationChange,
	needsAtomicRevertConfirmation,
	isLoading = false,
}: AtomicRevertChangesProps ) => {
	const [ isConfirmed, setIsConfirmed ] = useState( false );

	// Only show if there's an atomic transfer
	if ( ! atomicTransfer?.created_at ) {
		return null;
	}

	// Generate the list of changes based on the purchase type
	const getChangesList = () => {
		const changes = [];

		// Site will become private
		changes.push( __( 'Set your site to private.' ) );

		// Plugins and themes will be removed
		if ( ! purchase.is_refundable ) {
			changes.push(
				sprintf(
					/* translators: %(expiryDate)s is the date the themes and plugins will expire and will be removed */
					__(
						'Any themes and plugins you have installed will be removed on %(expiryDate)s, along with their data.'
					),
					{
						expiryDate: intlFormat( purchase.expiry_date, { dateStyle: 'medium' } ),
					}
				)
			);
		} else {
			changes.push( __( 'Remove your installed themes, plugins, and their data.' ) );
		}

		changes.push( __( 'Switch to the settings and theme you had before you upgraded.' ) );

		return changes;
	};

	const changes = getChangesList();

	const handleCheckboxChange = ( checked: boolean ) => {
		setIsConfirmed( checked );
		onConfirmationChange( checked );
	};

	return (
		<div className="cancel-purchase__atomic-revert-changes">
			<p>{ __( 'We will also make these changes to your site:' ) }</p>
			<ul className="cancel-purchase__atomic-revert-changes-list">
				{ changes.map( ( change, index ) => (
					<li key={ index }>
						<Icon
							className="cancel-purchase__atomic-revert-changes--item-notice"
							size={ 24 }
							icon={ info }
						/>
						<span>{ change }</span>
					</li>
				) ) }
			</ul>
			{ needsAtomicRevertConfirmation && (
				<label className="cancel-purchase__atomic-revert-checkbox-label">
					<CheckboxControl
						checked={ isConfirmed }
						onChange={ handleCheckboxChange }
						disabled={ isLoading }
					/>
					<span>{ __( 'I understand my site will change when my plan expires.' ) }</span>
				</label>
			) }
		</div>
	);
};

export default AtomicRevertChanges;
