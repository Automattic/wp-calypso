import {
	CheckboxControl,
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { published, swatch } from '@wordpress/icons';
import { CollapsibleCard } from '../../components/collapsible-card';

interface SetupStepProps {
	initiallyExpanded: boolean;
	completed: boolean;
	title: string;
	label: string;
	children: React.ReactNode;
	onCheckboxChange: ( checked: boolean ) => void;
	className?: string;
}

export default function SetupStep( {
	initiallyExpanded,
	completed,
	title,
	label,
	children,
	onCheckboxChange,
	className,
}: SetupStepProps ) {
	return (
		<CollapsibleCard
			className={ className }
			header={
				<HStack spacing={ 2 } justify="flex-start" alignment="left" expanded={ false }>
					<Icon
						size={ 24 }
						icon={ completed ? published : swatch }
						fill={
							completed
								? 'var(--dashboard__background-color-success)'
								: 'var(--dashboard__text-color)'
						}
					/>
					<Text size={ 14 } weight={ 500 }>
						{ title }
					</Text>
				</HStack>
			}
			initialExpanded={ initiallyExpanded }
			isBorderless
		>
			{ children }
			<CheckboxControl checked={ completed } onChange={ onCheckboxChange } label={ label } />
		</CollapsibleCard>
	);
}
