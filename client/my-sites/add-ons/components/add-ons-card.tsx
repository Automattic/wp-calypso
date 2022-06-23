import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Card, CardBody, CardFooter, CardHeader } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import type { AddOnMeta } from '../hooks/use-add-ons';

interface Props {
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
	highlightFeatured: boolean;
	addOnMeta: AddOnMeta;
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

		.add-ons-card__icon {
			display: flex;
		}

		.add-ons-card__name-and-billing {
			.add-ons-card__billing {
				color: var( --studio-gray-40 );
			}

			.add-ons-card__name-tag {
				display: flex;
				align-items: center;
				gap: 10px;

				.add-ons-card__featured-badge {
					border-radius: 4px;
				}
			}
		}
	}

	.add-ons-card__footer {
		display: flex;

		.add-ons-card__selected-tag {
			display: flex;
			align-items: center;

			.add-ons-card__checkmark {
				color: var( --studio-green-30 );
			}
		}
	}
`;

const AddOnCard = ( props: Props ) => {
	const translate = useTranslate();
	const status = props.useAddOnSelectedStatus?.( props.addOnMeta.slug );
	const onActionPrimary = () => {
		props.actionPrimary?.handler( props.addOnMeta.slug );
	};
	const onActionSelected = () => {
		props.actionSelected?.handler( props.addOnMeta.slug );
	};

	return (
		<Container>
			<Card className="add-ons-card">
				<CardHeader isBorderless={ true } className="add-ons-card__header">
					<div className="add-ons-card__icon">
						<Icon icon={ props.addOnMeta.icon } size={ 44 } />
					</div>
					<div className="add-ons-card__name-and-billing">
						<div className="add-ons-card__name-tag">
							<div>{ props.addOnMeta.name }</div>
							{ props.highlightFeatured && props.addOnMeta.featured && (
								<Badge key="popular" type="info-green" className="add-ons-card__featured-badge">
									{ translate( 'Popular' ) }
								</Badge>
							) }
						</div>
						<div className="add-ons-card__billing">
							{ props.addOnMeta.displayCost } / { props.addOnMeta.term }
						</div>
					</div>
				</CardHeader>
				<CardBody className="add-ons-card__body">{ props.addOnMeta.description }</CardBody>
				<CardFooter isBorderless={ true } className="add-ons-card__footer">
					{ status?.selected && props.actionSelected && (
						<>
							<Button onClick={ onActionSelected }>{ props.actionSelected.text }</Button>
							<div className="add-ons-card__selected-tag">
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
