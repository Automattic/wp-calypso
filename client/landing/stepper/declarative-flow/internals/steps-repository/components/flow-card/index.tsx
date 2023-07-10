import { __experimentalHStack as HStack, Card, CardBody, Icon } from '@wordpress/components';
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
		<Card className="stepper__flow-question" as="button" size="small" onClick={ onClick }>
			<CardBody>
				<HStack>
					<Icon icon={ icon } size={ 20 } />
					<div>
						<h3>{ title }</h3>
						<p>{ text }</p>
					</div>
					<Icon icon={ chevronRight } size={ 20 } />
				</HStack>
			</CardBody>
		</Card>
	);
};

export default FlowCard;
