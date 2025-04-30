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
import type { AddOnMeta } from '@automattic/data-stores';

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

			.add-ons-card__checkmark {
				color: var( --studio-green-30 );
			}
		}
	}
`;

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
	const shouldRenderSecondaryAction = ! purchaseStatus?.available && ! shouldRenderLoadingState;

	// Return null if the add-on isn't already purchased and the amount of storage isn't available
	// for purchase
	if ( storageAvailability === StorageAddOnAvailability.Unavailable && purchaseStatus.available ) {
		return null;
	}

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
						<div className="add-ons-card__billing">{ addOnMeta.displayCost }</div>
					</div>
				</CardHeader>
				<CardBody className="add-ons-card__body">{ addOnMeta.description }</CardBody>
				<CardFooter isBorderless className="add-ons-card__footer">
					{ shouldRenderLoadingState && (
						<Spinner size={ 24 } className="spinner-button__spinner" />
					) }
					{ shouldRenderSecondaryAction && (
						<>
							{ actionSecondary && (
								<Button onClick={ onActionSecondary } variant="secondary">
									{ translate( 'Manage add-on' ) }
								</Button>
							) }
							{ purchaseStatus?.text && (
								<div className="add-ons-card__selected-tag">
									<Gridicon size={ 16 } icon="checkmark" className="add-ons-card__checkmark" />
									<span>{ purchaseStatus.text }</span>
								</div>
							) }
						</>
					) }
					{ shouldRenderPrimaryAction && actionPrimary && (
						<Button variant="primary" onClick={ onActionPrimary }>
							{ translate( 'Buy add-on' ) }
						</Button>
					) }
				</CardFooter>
			</Card>
		</Container>
	);
};

export default AddOnCard;
