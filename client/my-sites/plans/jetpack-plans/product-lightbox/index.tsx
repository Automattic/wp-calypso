// import FoldableCard from 'calypso/components/foldable-card';
import { Button } from '@automattic/components';
import { useCallback, useState } from 'react';
import Modal from 'react-modal';
import MultiCheckbox from 'calypso/components/forms/multi-checkbox';
import { SelectorProduct } from '../types';
import BackupIcon from './icons/backup.svg';
import { Tags } from './icons/tags';
import './style.scss';

type Props = {
	product: SelectorProduct;
	isVisible: boolean;
	onClose: () => void;
};

const ProductLightbox: React.FC< Props > = ( { product, isVisible, onClose } ) => {
	const close = useCallback( () => onClose?.(), [ onClose ] );

	const [ checked, setChecked ] = useState( 1 );

	return (
		<Modal
			className="product-lightbox__modal"
			overlayClassName="product-lightbox__modal-overlay"
			isOpen={ isVisible }
			onRequestClose={ close }
			htmlOpenClassName="ReactModal__Html--open"
		>
			<div className="product-lightbox__content-wrapper">
				<div className="product-lightbox__detail">
					<div className="product-lightbox__detail-header">
						<img src={ BackupIcon } alt="Backup" />
						<h2>{ product.displayName }</h2>
					</div>
					<div className="product-lightbox__detail-desc">
						<p>
							Protect your site or store. Save every change with real-time cloud backups, and
							restore in one click from anywhere. Protect your site or store. Save every change with
							real-time cloud backups, and restore in one click from anywhere. Protect your site or
							store. Save every change with real-time cloud backups, and restore in one click from
							anywhere. Protect your site or store. Save every change with real-time cloud backups,
							and restore in one click from anywhere.
						</p>
					</div>
					<div className="product-lightbox__detail-tags">
						<span className="product-lightbox__detail-tags-label">Best for:</span>
						<span className="product-lightbox__detail-tags-tag">
							{ Tags.woo.icon }
							<p>WooCommerce stores</p>
						</span>
						<span className="product-lightbox__detail-tags-tag">
							{ Tags.news.icon }
							<p>{ Tags.news.label }</p>
						</span>
						<span className="product-lightbox__detail-tags-tag">
							{ Tags.membership.icon }
							<p>{ Tags.membership.label }</p>
						</span>
						<span className="product-lightbox__detail-tags-tag">
							{ Tags.forum.icon }
							<p>{ Tags.forum.label }</p>
						</span>
					</div>
					{ /* <FoldableCard header="Includes" compact> */ }

					<div className="product-lightbox__detail-list">
						<p>Includes</p>
						<ul>
							<li>Real-time backups as you edit</li>
							<li>10GB of cloud storage</li>
							<li>30-day activity log archive</li>
							<li>Unlimited one-click restores from the last 30 days</li>
							<li>WooCommerce order and table backups</li>
							<li>Redundant cloud backups on our global network</li>
							<li>Priority support</li>
						</ul>
					</div>
					{ /* </FoldableCard> */ }
					<hr />
					{ /* <FoldableCard header="Benefits" compact> */ }
					<div className="product-lightbox__detail-list">
						<p>Benefits</p>
						<ul>
							<li>Restore your site in one click from desktop or mobile</li>
							<li>Restore offline sites</li>
							<li>No developer required</li>
							<li>Protect Woo order and customer data</li>
							<li>Best-in-class support from WordPress experts</li>
						</ul>
					</div>
					{ /* </FoldableCard> */ }
				</div>
				<div className="product-lightbox__variants">
					<div className="product-lightbox__variants-content">
						<p>Choose a storage option:</p>
						<div className="product-lightbox__variants-option">
							<MultiCheckbox
								options={ [
									{ value: 1, label: '10GB' },
									{ value: 2, label: '1TB(1,000GB)' },
								] }
								checked={ [ checked ] }
								// TODO: Fix types of MultiCheckbox to avoid `any`
								//eslint-disable-next-line @typescript-eslint/no-explicit-any
								onChange={ ( list: any ) => {
									setChecked( Number.parseInt( list.value[ list.value.length - 1 ] ) );
								} }
							/>
						</div>

						<p>Payment plan:</p>

						<div className="product-lightbox__variants-plan-card">
							<div className="product-lightbox__variants-grey-label">
								<span className="product-lightbox__variants-plan-card-price">{ '$4.95' }</span>
								<span className="product-lightbox__variants-plan-card-month-short">/mo</span>
								<span className="product-lightbox__variants-plan-card-month-long">/month</span>,
								billed yearly
							</div>
							<div className="product-lightbox__variants-grey-label">
								<span className="product-lightbox__variants-plan-card-old-price">{ '$9.95' }</span>
								59% off the first year
							</div>
						</div>

						<Button
							primary
							className="jetpack-product-card__button product-lightbox__checkout-button"
							href={ 'https://automattic.com' }
						>
							{ 'Checkout' }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ProductLightbox;
