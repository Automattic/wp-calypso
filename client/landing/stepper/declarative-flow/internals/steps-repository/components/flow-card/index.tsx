import { Flex, FlexBlock, FlexItem, Card, CardBody, Icon } from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import './style.scss';

interface FlowCardProps {
	icon: JSX.Element;
	onClick: () => void;
	text: string;
	title: string;
}

const FlowCard = ( { icon, onClick, text, title }: FlowCardProps ) => {
	return (
		<Card className="flow-question" as="button" size="small" onClick={ onClick }>
			<CardBody>
				<Flex>
					<FlexItem>
						<Icon icon={ icon } size={ 20 } />
					</FlexItem>
					<FlexBlock>
						<h3 className="flow-question__heading">{ title }</h3>
						<p>{ text }</p>
					</FlexBlock>
					<FlexItem>
						<Icon icon={ chevronRight } size={ 20 } />
					</FlexItem>
				</Flex>
			</CardBody>
		</Card>
	);
};

export default FlowCard;
