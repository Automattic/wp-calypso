import { Gridicon } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { isRefundable } from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';

import './style.scss';

type AtomicRevertChangesProps = {
	atomicTransfer: {
		created_at?: string;
	};
	purchase: Purchase;
	onConfirmationChange: ( isChecked: boolean ) => void;
};

const AtomicRevertChanges = ( {
	atomicTransfer,
	purchase,
	onConfirmationChange,
}: AtomicRevertChangesProps ) => {
	const translate = useTranslate();

	// Only show for non-refundable plans with atomic transfer
	if ( ! atomicTransfer?.created_at ) {
		return null;
	}

	// Generate the list of changes based on the purchase type
	const getChangesList = () => {
		const changes = [];

		// Site will become private
		changes.push( translate( 'Set your site to private.' ) );

		// Site will revert to original state
		changes.push(
			translate(
				'Your site will revert to its original settings and theme from before the first plugin or custom theme was installed'
			)
		);

		// Plugins and themes will be removed
		if ( ! isRefundable( purchase ) ) {
			changes.push(
				translate(
					'Any themes and plugins you have installed will be removed on %(expiryDate)s, along with their data',
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

	return (
		<div className="cancel-purchase__atomic-revert-changes">
			<p>{ translate( 'We will also make these changes to your site:' ) }</p>
			<ul className="cancel-purchase__atomic-revert-changes-list">
				{ changes.map( ( change, index ) => (
					<li key={ index }>
						<Gridicon
							className="cancel-purchase__atomic-revert-changes--item-notice"
							size={ 18 }
							icon="notice-outline"
						/>
						<span>{ change }</span>
					</li>
				) ) }
			</ul>
			<CheckboxControl
				label={ translate( 'I understand my site will change when my plan expires.' ) }
				onChange={ onConfirmationChange }
			/>
		</div>
	);
};

export default AtomicRevertChanges;
