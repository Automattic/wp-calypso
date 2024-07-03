import { Badge } from '@automattic/components';
import { Flex, FlexBlock, FlexItem, Card, CardBody, Icon } from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import type { BadgeType } from '@automattic/components';
import './style.scss';

interface FlowCardProps {
	icon?: JSX.Element;
	onClick: () => void;
	text: string;
	title: string;
	disabled?: boolean;
	badge?: {
		type: BadgeType;
		text: string;
	};
}

const FlowCard = ( { icon, onClick, text, title, disabled = false, badge }: FlowCardProps ) => {
	return (
		<Card
			className="flow-question"
			as="button"
			size="small"
			onClick={ onClick }
			disabled={ disabled }
		>
			<CardBody>
				<Flex>
					{ icon && (
						<FlexItem className="flow-question__icon">
							<Icon icon={ icon } size={ 24 } />
						</FlexItem>
					) }
					<FlexBlock>
						<div className="flow-question__title-wrapper">
							<h3 className="flow-question__heading">{ title }</h3>
							{ badge && <Badge type={ badge.type }>{ badge.text }</Badge> }
						</div>
						<p className="flow-question__description">{ text }</p>
					</FlexBlock>
					<FlexItem>
						<Icon icon={ chevronRight } size={ 24 } />
					</FlexItem>
				</Flex>
			</CardBody>
		</Card>
	);
};

export default FlowCard;
