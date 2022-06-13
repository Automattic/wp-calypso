import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Card, CardBody, CardFooter, CardHeader } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getProductDisplayCost, getProductTerm } from 'calypso/state/products-list/selectors';
import type { AddOnMeta } from '../hooks/use-add-ons';

interface Props extends AddOnMeta {
	actionPrimary?: {
		text: string | React.ReactChild;
		handler: ( addOnSlug: string ) => void;
	};
	actionSelected?: {
		text: string | React.ReactChild;
		handler: ( addOnSlug: string ) => void;
	};
	// returns true/false if add-on is to be treated as "selected" (either added to cart, or part of plan, or ...)
	// can extend to return a "selected status" string, if we need to tailor
	useAddOnSelectedStatus?: ( addOnSlug: string ) => boolean;
}

const Container = styled.div`
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
		align-items: center;

		.add-ons-card__checkmark {
			color: var( --studio-green-30 );
		}
	}

	.add-ons-card__billing-info {
		color: var( --studio-gray-40 );
	}

	.add-ons-card__icon {
		display: flex;
	}
`;

const BillingInfo = ( { addOnSlug }: { addOnSlug: string } ) => {
	const price = useSelector( ( state ) => getProductDisplayCost( state, addOnSlug ) );
	const term = useSelector( ( state ) => getProductTerm( state, addOnSlug ) );

	return (
		<div className="add-ons-card__billing-info">
			{ price } / { term }
		</div>
	);
};

const AddOnCard = ( props: Props ) => {
	const translate = useTranslate();
	const isSelected = props.useAddOnSelectedStatus?.( props.slug );
	const onActionPrimary = () => {
		props.actionPrimary?.handler( props.slug );
	};
	const onActionSelected = () => {
		props.actionSelected?.handler( props.slug );
	};

	return (
		<Container>
			<Card>
				<CardHeader isBorderless={ true } className="add-ons-card__header">
					<div className="add-ons-card__icon">
						<Icon icon={ props.icon } size={ 44 } />
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
								<Gridicon icon="checkmark" className={ 'add-ons-card__checkmark' } />
								<span>{ translate( 'Included in your plan' ) }</span>
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
		</Container>
	);
};

export default AddOnCard;
