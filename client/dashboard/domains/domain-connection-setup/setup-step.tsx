import {
	CheckboxControl,
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { published, swatch } from '@wordpress/icons';
import clsx from 'clsx';
import { CollapsibleCard } from '../../components/collapsible-card';

interface SetupStepProps {
	expanded: boolean;
	completed: boolean;
	stepNumber?: number;
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
	stepNumber,
	title,
	label,
	children,
	onCheckboxChange,
	onToggle,
	className,
}: SetupStepProps ) {
	let stepIndicator: React.ReactNode = (
		<Icon className="setup-step__pending-icon" size={ 20 } icon={ swatch } />
	);

	if ( stepNumber ) {
		stepIndicator = (
			<span
				className={ clsx( 'setup-step__number', { 'is-current': expanded } ) }
				aria-hidden="true"
			>
				{ stepNumber }
			</span>
		);
	}

	if ( completed ) {
		stepIndicator = <Icon className="setup-step__completed-icon" size={ 20 } icon={ published } />;
	}

	return (
		<CollapsibleCard
			className={ clsx( 'setup-step', className ) }
			header={
				<HStack spacing={ 3 } justify="flex-start" alignment="left">
					{ stepIndicator }
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
			<VStack spacing={ 4 } style={ { paddingInlineStart: '32px', paddingTop: '16px' } }>
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
