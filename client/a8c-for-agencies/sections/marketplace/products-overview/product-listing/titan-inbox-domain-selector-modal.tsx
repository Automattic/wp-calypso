import { formatCurrency } from '@automattic/number-formatters';
import { Button, Modal, SearchControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import A4ANumberInputV2 from 'calypso/a8c-for-agencies/components/a4a-number-input-v2';
import pressableIcon from 'calypso/assets/images/a8c-for-agencies/product-logos/pressable.svg';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

export type TitanInboxDomain = {
	domain: string;
	siteName: string;
	planName: string;
	trialEndsAt: string;
	activeInboxes: number;
	allowedInboxes: number;
};

export const TITAN_INBOX_MOCK_DOMAINS: TitanInboxDomain[] = [
	{
		domain: 'client-alpha.com',
		siteName: 'Client Alpha',
		planName: 'Signature 50',
		trialEndsAt: 'Oct 14, 2026',
		activeInboxes: 1,
		allowedInboxes: 3,
	},
	{
		domain: 'northstar-studio.test',
		siteName: 'Northstar Studio',
		planName: 'Signature 100',
		trialEndsAt: 'Oct 14, 2026',
		activeInboxes: 0,
		allowedInboxes: 1,
	},
	{
		domain: 'shop.example-agency.com',
		siteName: 'Example Shop',
		planName: 'Signature 250',
		trialEndsAt: 'Sep 30, 2026',
		activeInboxes: 3,
		allowedInboxes: 5,
	},
	{
		domain: 'pressable-client.dev',
		siteName: 'Pressable Client Dev',
		planName: 'Signature 20',
		trialEndsAt: 'Nov 2, 2026',
		activeInboxes: 1,
		allowedInboxes: 2,
	},
	{
		domain: 'launch-campaign.co',
		siteName: 'Launch Campaign',
		planName: 'Signature 50',
		trialEndsAt: 'Oct 28, 2026',
		activeInboxes: 2,
		allowedInboxes: 4,
	},
];

type Props = {
	product: APIProductFamilyProduct;
	domains: TitanInboxDomain[];
	onClose: () => void;
	onConfirm: ( domain: TitanInboxDomain, inboxQuantity: number ) => void;
};

export default function TitanInboxDomainSelectorModal( {
	product,
	domains,
	onClose,
	onConfirm,
}: Props ) {
	const translate = useTranslate();
	const [ search, setSearch ] = useState( '' );
	const [ selectedDomainName, setSelectedDomainName ] = useState< string | null >( null );
	const [ inboxQuantity, setInboxQuantity ] = useState( 1 );

	const filteredDomains = useMemo( () => {
		const normalizedSearch = search.trim().toLowerCase();

		if ( ! normalizedSearch ) {
			return domains;
		}

		return domains.filter( ( domain ) =>
			[ domain.domain, domain.siteName, domain.planName ].some( ( value ) =>
				value.toLowerCase().includes( normalizedSearch )
			)
		);
	}, [ domains, search ] );

	const selectedDomain = useMemo(
		() => domains.find( ( domain ) => domain.domain === selectedDomainName ) ?? null,
		[ domains, selectedDomainName ]
	);

	const productPrice = Number( product.monthly_price ?? product.amount );
	const formattedPrice = Number.isFinite( productPrice )
		? formatCurrency( productPrice * inboxQuantity, product.currency || 'USD' )
		: product.amount;

	const handleInboxQuantityChange = ( value: number ) => {
		setInboxQuantity( Math.max( 1, Math.round( value ) ) );
	};

	return (
		<Modal
			className="titan-inbox-domain-selector-modal"
			title={ translate( 'Select a domain for Titan Inbox' ) }
			onRequestClose={ onClose }
		>
			<div className="titan-inbox-domain-selector-modal__layout">
				<div className="titan-inbox-domain-selector-modal__main">
					<div className="titan-inbox-domain-selector-modal__intro">
						<img src={ pressableIcon } alt="" />
						<p>
							{ translate(
								'Choose the Pressable domain where this inbox slot should be provisioned.'
							) }
						</p>
					</div>
					<SearchControl
						label={ translate( 'Search domains' ) }
						placeholder={ translate( 'Search domains' ) }
						value={ search }
						onChange={ ( value = '' ) => setSearch( value ) }
					/>
					<div
						className="titan-inbox-domain-selector-modal__domains"
						role="radiogroup"
						aria-label={ translate( 'Pressable domains' ) }
					>
						{ filteredDomains.map( ( domain ) => {
							const isSelected = selectedDomainName === domain.domain;

							return (
								<button
									key={ domain.domain }
									type="button"
									className={ clsx( 'titan-inbox-domain-selector-modal__domain-option', {
										'is-selected': isSelected,
									} ) }
									role="radio"
									aria-checked={ isSelected }
									onClick={ () => setSelectedDomainName( domain.domain ) }
								>
									<span className="titan-inbox-domain-selector-modal__domain-primary">
										<span className="titan-inbox-domain-selector-modal__domain-name">
											{ domain.domain }
										</span>
										<span className="titan-inbox-domain-selector-modal__domain-site">
											{ domain.siteName }
										</span>
									</span>
									<span className="titan-inbox-domain-selector-modal__domain-meta">
										<span>{ domain.planName }</span>
										<span>
											{ translate( 'Trial ends %(trialEndsAt)s', {
												args: { trialEndsAt: domain.trialEndsAt },
											} ) }
										</span>
										<span>
											{ translate( '%(activeInboxes)d/%(allowedInboxes)d inboxes active', {
												args: {
													activeInboxes: domain.activeInboxes,
													allowedInboxes: domain.allowedInboxes,
												},
											} ) }
										</span>
									</span>
								</button>
							);
						} ) }
						{ filteredDomains.length === 0 && (
							<div className="titan-inbox-domain-selector-modal__empty">
								{ translate( 'No domains match this search.' ) }
							</div>
						) }
					</div>
				</div>
				<aside className="titan-inbox-domain-selector-modal__aside">
					<div className="titan-inbox-domain-selector-modal__price-box">
						<div className="titan-inbox-domain-selector-modal__product-name">{ product.name }</div>
						<div className="titan-inbox-domain-selector-modal__price">{ formattedPrice }</div>
						<div className="titan-inbox-domain-selector-modal__interval">
							{ translate( 'per month' ) }
						</div>
					</div>
					<div className="titan-inbox-domain-selector-modal__summary">
						<div className="titan-inbox-domain-selector-modal__summary-label">
							{ translate( 'Selected domain' ) }
						</div>
						<div className="titan-inbox-domain-selector-modal__summary-value">
							{ selectedDomain?.domain ?? translate( 'No domain selected' ) }
						</div>
						{ selectedDomain && (
							<div className="titan-inbox-domain-selector-modal__summary-note">
								{ translate( 'The inbox keeps the domain trial end date: %(trialEndsAt)s.', {
									args: { trialEndsAt: selectedDomain.trialEndsAt },
								} ) }
							</div>
						) }
					</div>
					{ selectedDomain && (
						<div className="titan-inbox-domain-selector-modal__quantity">
							<div className="titan-inbox-domain-selector-modal__quantity-copy">
								<div className="titan-inbox-domain-selector-modal__quantity-label">
									{ translate( 'Inbox quantity' ) }
								</div>
								<div className="titan-inbox-domain-selector-modal__quantity-description">
									{ translate( 'Choose how many inbox slots to add for this domain.' ) }
								</div>
							</div>
							<A4ANumberInputV2
								value={ inboxQuantity }
								onChange={ handleInboxQuantityChange }
								minimum={ 1 }
							/>
						</div>
					) }
					<Button
						variant="primary"
						disabled={ ! selectedDomain }
						onClick={ () => selectedDomain && onConfirm( selectedDomain, inboxQuantity ) }
					>
						{ translate( 'Add to cart' ) }
					</Button>
				</aside>
			</div>
		</Modal>
	);
}
