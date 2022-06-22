import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Card, CardBody, CardFooter, CardHeader } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
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
	useAddOnSelectedStatus?: ( addOnSlug: string ) => {
		selected: boolean;
		text?: string | React.ReactChild;
	};
}

const Container = styled.div`
	.add-ons-card {
		width: 100%;
		height: 100%;

		> div {
			// @wordpress/components<Card> wraps content in a first inner div
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
	}

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

const AddOnCard = ( props: Props ) => {
	const status = props.useAddOnSelectedStatus?.( props.slug );
	const onActionPrimary = () => {
		props.actionPrimary?.handler( props.slug );
	};
	const onActionSelected = () => {
		props.actionSelected?.handler( props.slug );
	};

	return (
		<Container>
			<Card className="add-ons-card">
				<CardHeader isBorderless={ true } className="add-ons-card__header">
					<div className="add-ons-card__icon">
						<Icon icon={ props.icon } size={ 44 } />
					</div>
					<div>
						<div>{ props.name }</div>
						<div className="add-ons-card__billing-info">
							{ props.displayCost } / { props.term }
						</div>
					</div>
				</CardHeader>
				<CardBody className="add-ons-card__body">{ props.description }</CardBody>
				<CardFooter isBorderless={ true } className="add-ons-card__footer">
					{ status?.selected && props.actionSelected && (
						<>
							<Button onClick={ onActionSelected }>{ props.actionSelected.text }</Button>
							<div className="add-ons-card__selected-badge">
								<Gridicon icon="checkmark" className={ 'add-ons-card__checkmark' } />
								<span>{ status.text }</span>
							</div>
						</>
					) }
					{ ! status?.selected && props.actionPrimary && (
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
