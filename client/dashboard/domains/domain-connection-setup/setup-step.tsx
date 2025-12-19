import {
	CheckboxControl,
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { published, swatch } from '@wordpress/icons';
import { CollapsibleCard } from '../../components/collapsible-card';

interface SetupStepProps {
	expanded: boolean;
	completed: boolean;
	title: string;
	label?: string;
	children: React.ReactNode;
	onCheckboxChange: ( checked: boolean ) => void;
	onToggle: ( expanded: boolean ) => void;
	className?: string;
}

export default function SetupStep( {
	expanded,
	completed,
	title,
	label,
	children,
	onCheckboxChange,
	onToggle,
	className,
}: SetupStepProps ) {
	return (
		<CollapsibleCard
			className={ className }
			header={
				<HStack spacing={ 4 } justify="flex-start" alignment="left" expanded={ false }>
					<Icon
						size={ 24 }
						icon={ completed ? published : swatch }
						fill={
							completed
								? 'var(--dashboard__background-color-success)'
								: 'var(--dashboard-menu-item__color)'
						}
					/>
					<Text size={ 15 } weight={ 500 }>
						{ title }
					</Text>
				</HStack>
			}
			expanded={ expanded }
			onToggle={ onToggle }
			size={ { blockStart: 'medium', blockEnd: 'medium', inlineStart: 'none', inlineEnd: 'none' } }
			isBorderless
		>
			<VStack spacing={ 6 } style={ { paddingInlineStart: '40px', paddingTop: '16px' } }>
				{ children }
				{ label && (
					<CheckboxControl
						checked={ completed }
						onChange={ onCheckboxChange }
						label={ label }
						__nextHasNoMarginBottom
					/>
				) }
			</VStack>
		</CollapsibleCard>
	);
}
