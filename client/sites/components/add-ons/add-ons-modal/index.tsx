import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { AddOns } from '@automattic/data-stores';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import AddOnCard from '../add-ons-card';

import './style.scss';

type AddOnsModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export default function AddOnsModal( { isOpen, onClose }: AddOnsModalProps ) {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const addOns = AddOns.useAddOns( { selectedSiteId: site?.ID } );
	const nonStorageAddOns = addOns.filter( ( addOn ) => addOn?.productSlug !== PRODUCT_1GB_SPACE );

	const checkoutLink = AddOns.useAddOnCheckoutLink();

	const handleActionPrimary = ( addOnSlug: string, quantity?: number ) => {
		recordTracksEvent( 'calypso_add_ons_action_primary_click', {
			add_on_slug_with_quantity: `${ addOnSlug }${ quantity ? `:${ quantity }` : '' }`,
			add_on_slug: addOnSlug,
			quantity,
		} );

		page.redirect( `${ checkoutLink( site?.ID ?? null, addOnSlug, quantity ) }` );
	};

	const handleActionSecondary = () => {
		page.redirect( `/purchases/subscriptions/${ site?.slug }` );
	};

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			className="add-ons-modal"
			title={ translate( 'Boost your plan with add-ons' ) }
			onRequestClose={ onClose }
		>
			<span className="add-ons-modal__description">
				{ translate(
					'Expand the functionality of your WordPress.com site by enabling any of the following features.'
				) }
			</span>
			<div className="add-ons-modal__cards">
				{ nonStorageAddOns.map( ( addOn ) =>
					addOn ? (
						<AddOnCard
							key={ addOn.productSlug }
							actionPrimary={ handleActionPrimary }
							actionSecondary={ handleActionSecondary }
							addOnMeta={ addOn }
							highlightFeatured={ false }
						/>
					) : null
				) }
			</div>
		</Modal>
	);
}
