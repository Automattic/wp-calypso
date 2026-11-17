import { Badge, Gridicon, Spinner } from '@automattic/components';
import {
	useAddOnPurchaseStatus,
	useStorageAddOnAvailability,
	StorageAddOnAvailability,
} from '@automattic/data-stores/src/add-ons';
import styled from '@emotion/styled';
import { Card, CardBody, CardFooter, CardHeader, Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AddOnMeta, AnyAddOnMeta } from '@automattic/data-stores';
import type { ReactNode } from 'react';

export interface Props {
	actionPrimary?: ( productSlug: string, quantity?: number ) => void;
	actionSecondary?: ( productSlug: string ) => void;
	highlightFeatured: boolean;
	addOnMeta: AddOnMeta;
}

const Container = styled.div`
	.add-ons-card {
		width: 100%;
		height: 100%;
		border-radius: 5px;

		> div {
			// @wordpress/components<Card> wraps content in a first inner div
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			padding: 8px 0;
		}
	}

	.add-ons-card__header {
		display: flex;
		justify-content: flex-start;
		gap: 0.8em;

		.add-ons-card__icon {
			display: flex;
			padding: 10px;
			border-radius: 4px;
			background-color: var( --studio-blue-5 );
		}

		.add-ons-card__name-and-billing {
			.add-ons-card__billing {
				color: var( --studio-gray-60 );
				font-size: 0.75rem;
			}

			.add-ons-card__name-tag {
				display: flex;
				align-items: center;
				gap: 10px;

				.add-ons-card__name {
					font-size: 1rem;
					font-weight: 500;
				}

				.add-ons-card__featured-badge {
					border-radius: 4px;
					font-size: 0.75rem;
					font-weight: 500;
				}
			}
		}
	}

	.add-ons-card__body {
		font-size: 0.875rem;
		padding-top: 0;
		padding-bottom: 0;
		margin-bottom: 0;
	}

	.add-ons-card__footer {
		display: flex;
		margin-top: auto;

		.add-ons-card__action-button {
			font-weight: 600;
			text-decoration: none;
			padding: 0;
		}

		.add-ons-card__selected-tag {
			display: flex;
			align-items: center;
			gap: 0.5em;
			font-size: 13px;
			// Match the action button's height so the footer is the same height with or
			// without a button, keeping the status text aligned across cards.
			min-height: 36px;

			.add-ons-card__checkmark {
				color: var( --studio-green-30 );
			}
		}
	}
`;

interface LayoutProps {
	addOnMeta: AnyAddOnMeta;
	highlightFeatured: boolean;
	billing?: ReactNode;
	children: ReactNode;
}

/**
 * The card frame that every add-on shares: icon, name, billing line, description, and a footer.
 */
export const AddOnCardLayout = ( {
	addOnMeta,
	highlightFeatured,
	billing = addOnMeta.displayCost,
	children,
}: LayoutProps ) => {
	const translate = useTranslate();

	return (
		<Container>
			<Card className="add-ons-card">
				<CardHeader isBorderless className="add-ons-card__header">
					<div className="add-ons-card__icon">
						{ addOnMeta.icon && <Icon icon={ addOnMeta.icon } size={ 24 } /> }
					</div>
					<div className="add-ons-card__name-and-billing">
						<div className="add-ons-card__name-tag">
							<div className="add-ons-card__name">{ addOnMeta.name }</div>
							{ highlightFeatured && addOnMeta.featured && (
								<Badge key="popular" type="info-green" className="add-ons-card__featured-badge">
									{ translate( 'Popular' ) }
								</Badge>
							) }
						</div>
						<div className="add-ons-card__billing">{ billing }</div>
					</div>
				</CardHeader>
				<CardBody as="p" className="add-ons-card__body">
					{ addOnMeta.description }
				</CardBody>
				<CardFooter isBorderless className="add-ons-card__footer">
					{ children }
				</CardFooter>
			</Card>
		</Container>
	);
};

export const AddOnCardStatus = ( { children }: { children: ReactNode } ) => (
	<div className="add-ons-card__selected-tag">
		<Gridicon size={ 16 } icon="checkmark" className="add-ons-card__checkmark" />
		<span>{ children }</span>
	</div>
);

const AddOnCard = ( { addOnMeta, actionPrimary, actionSecondary, highlightFeatured }: Props ) => {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const purchaseStatus = useAddOnPurchaseStatus( { selectedSiteId, addOnMeta } );
	const storageAvailability = useStorageAddOnAvailability( { selectedSiteId, addOnMeta } );

	const onActionPrimary = () => {
		actionPrimary?.( addOnMeta.productSlug, addOnMeta.quantity );
	};
	const onActionSecondary = () => {
		actionSecondary?.( addOnMeta.productSlug );
	};

	const shouldRenderLoadingState = addOnMeta.isLoading;
	const shouldRenderPrimaryAction = purchaseStatus?.available && ! shouldRenderLoadingState;
	const shouldRenderPurchaseStatus = ! purchaseStatus?.available && ! shouldRenderLoadingState;
	// Only a separately purchased add-on has something to manage in the site's subscriptions.
	const shouldRenderSecondaryAction =
		purchaseStatus?.reason === 'purchased' && ! shouldRenderLoadingState;

	// Return null if the add-on isn't already purchased and the amount of storage isn't available
	// for purchase
	if ( storageAvailability === StorageAddOnAvailability.Unavailable && purchaseStatus.available ) {
		return null;
	}

	return (
		<AddOnCardLayout addOnMeta={ addOnMeta } highlightFeatured={ highlightFeatured }>
			{ shouldRenderLoadingState && <Spinner size={ 24 } className="spinner-button__spinner" /> }
			{ shouldRenderSecondaryAction && actionSecondary && (
				<Button onClick={ onActionSecondary } variant="secondary">
					{ translate( 'Manage add-on' ) }
				</Button>
			) }
			{ shouldRenderPurchaseStatus && purchaseStatus?.text && (
				<AddOnCardStatus>{ purchaseStatus.text }</AddOnCardStatus>
			) }
			{ shouldRenderPrimaryAction && actionPrimary && (
				<Button variant="primary" onClick={ onActionPrimary }>
					{ translate( 'Buy add-on' ) }
				</Button>
			) }
		</AddOnCardLayout>
	);
};

export default AddOnCard;
