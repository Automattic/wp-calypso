import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { isRefundable } from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';

import './style.scss';

type AtomicRevertChangesProps = {
	atomicTransfer: {
		created_at?: string;
	};
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
	const translate = useTranslate();
	const [ isConfirmed, setIsConfirmed ] = useState( false );

	// Only show if there's an atomic transfer
	if ( ! atomicTransfer?.created_at ) {
		return null;
	}

	// Generate the list of changes based on the purchase type
	const getChangesList = () => {
		const changes = [];

		// Site will become private
		changes.push( translate( 'Set your site to private.' ) );

		// Plugins and themes will be removed
		if ( ! isRefundable( purchase ) ) {
			changes.push(
				translate(
					'Any themes and plugins you have installed will be removed on %(expiryDate)s, along with their data.',
					{
						args: {
							expiryDate: moment( purchase.expiryDate ).format( 'LL' ),
						},
					}
				)
			);
		} else {
			changes.push( translate( 'Remove your installed themes, plugins, and their data.' ) );
		}

		changes.push( translate( 'Switch to the settings and theme you had before you upgraded.' ) );

		return changes;
	};

	const changes = getChangesList();

	const handleCheckboxChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const checked = event.target.checked;
		setIsConfirmed( checked );
		onConfirmationChange( checked );
	};

	return (
		<div className="cancel-purchase__atomic-revert-changes">
			<p>{ translate( 'We will also make these changes to your site:' ) }</p>
			<ul className="cancel-purchase__atomic-revert-changes-list">
				{ changes.map( ( change, index ) => (
					<li key={ index }>
						<Gridicon
							className="cancel-purchase__atomic-revert-changes--item-notice"
							size={ 24 }
							icon="notice-outline"
						/>
						<span>{ change }</span>
					</li>
				) ) }
			</ul>
			{ needsAtomicRevertConfirmation && (
				<label className="cancel-purchase__atomic-revert-checkbox-label">
					<FormCheckbox
						checked={ isConfirmed }
						onChange={ handleCheckboxChange }
						disabled={ isLoading }
					/>
					<span>{ translate( 'I understand my site will change when my plan expires.' ) }</span>
				</label>
			) }
		</div>
	);
};

export default AtomicRevertChanges;
