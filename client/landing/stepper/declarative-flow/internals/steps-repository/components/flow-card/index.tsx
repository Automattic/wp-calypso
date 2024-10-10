import { Badge } from '@automattic/components';
import { Flex, FlexBlock, FlexItem, Card, CardBody, Icon } from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
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
	className?: string;
}

const FlowCard = ( {
	icon,
	onClick,
	text,
	title,
	disabled = false,
	badge,
	className,
}: FlowCardProps ) => {
	return (
		<Card
			className={ clsx( 'flow-question', className ) }
			as="button"
			size="small"
			onClick={ onClick }
			disabled={ disabled }
		>
			<CardBody>
				<Flex>
					{ icon && (
						<FlexItem className={ clsx( 'flow-question__icon', `${ className }__icon` ) }>
							<Icon icon={ icon } size={ 24 } />
						</FlexItem>
					) }
					<FlexBlock>
						<h3 className={ clsx( 'flow-question__heading', `${ className }__heading` ) }>
							{ title }
							{ badge && <Badge type={ badge.type }>{ badge.text }</Badge> }
						</h3>
						<p className={ clsx( 'flow-question__description', `${ className }__description` ) }>
							{ text }
						</p>
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
