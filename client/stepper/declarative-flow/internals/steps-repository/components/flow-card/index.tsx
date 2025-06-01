import { Badge } from '@automattic/components';
import { Flex, FlexBlock, FlexItem, Card, CardBody, Icon } from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { type ReactNode } from 'react';
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
		text: ReactNode;
	};
	className?: string;
}

const bemElement = ( customClassName?: string ) => ( element: string ) =>
	customClassName ? `${ customClassName }__${ element }` : undefined;

const FlowCard = ( {
	icon,
	onClick,
	text,
	title,
	disabled = false,
	badge,
	className,
}: FlowCardProps ) => {
	const bem = bemElement( className );

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
						<FlexItem className={ clsx( 'flow-question__icon', bem( 'icon' ) ) }>
							<Icon icon={ icon } size={ 24 } />
						</FlexItem>
					) }
					<FlexBlock>
						<h3 className={ clsx( 'flow-question__heading', bem( 'heading' ) ) }>
							{ title }
							{ badge && <Badge type={ badge.type }>{ badge.text }</Badge> }
						</h3>
						<p className={ clsx( 'flow-question__description', bem( 'description' ) ) }>{ text }</p>
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
