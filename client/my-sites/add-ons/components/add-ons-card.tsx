import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Card, CardBody, CardFooter, CardHeader } from '@wordpress/components';
import { useSelector } from 'react-redux';
import { getProductDisplayCost } from 'calypso/state/products-list/selectors';
import type { AddOn } from '../hooks/use-add-ons';

interface Props extends AddOn {
	actionPrimary?: {
		text: string;
		handler: ( slug: string ) => void;
	};
	actionSelected?: {
		text: string;
		handler: ( slug: string ) => void;
	};
	isSelected?: ( slug: string ) => boolean;
}

const Frame = styled.div`
	width: 100%;
	.add-ons-card__header {
		display: flex;
		justify-content: flex-start;
	}

	.add-ons-card__footer {
		display: flex;
	}

	.add-ons-card__selected-badge {
		display: flex;
	}

	.add-ons-card__billing-info {
		color: var( --studio-gray-40 );
	}
`;

const BillingInfo = ( { addOnSlug }: { addOnSlug: string } ) => {
	const price = useSelector( ( state ) => getProductDisplayCost( state, addOnSlug ) );

	return <div className="add-ons-card__billing-info">{ price }</div>;
};

const AddOnCard = ( props: Props ) => {
	const isSelected = props.isSelected?.( props.slug );

	const onActionPrimary = () => {
		props.actionPrimary?.handler( props.slug );
	};

	const onActionSelected = () => {
		props.actionSelected?.handler( props.slug );
	};

	return (
		<Frame>
			<Card>
				<CardHeader isBorderless={ true } className="add-ons-card__header">
					<div>
						<Gridicon icon="customize" size={ 48 } />
					</div>
					<div>
						<div>{ props.name }</div>
						<BillingInfo addOnSlug={ props.slug } />
					</div>
				</CardHeader>
				<CardBody>{ props.description }</CardBody>
				<CardFooter isBorderless={ true } className="add-ons-card__footer">
					{ isSelected && props.actionSelected && (
						<>
							<Button onClick={ onActionSelected }>{ props.actionSelected.text }</Button>
							<div className="add-ons-card__selected-badge">
								<Gridicon icon="checkmark" />
								<span>Included in your plan</span>
							</div>
						</>
					) }
					{ ! isSelected && props.actionPrimary && (
						<Button onClick={ onActionPrimary } primary>
							{ props.actionPrimary.text }
						</Button>
					) }
				</CardFooter>
			</Card>
		</Frame>
	);
};

export default AddOnCard;
