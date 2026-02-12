import {
	__experimentalHStack as HStack,
	Icon,
	__experimentalText as Text,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import type { ProgressStepList, StepNameValue } from '../types';

import './progress.scss';

interface ProgressProps {
	steps: ProgressStepList;
	currentStepName: StepNameValue;
}

export default function Progress( { steps, currentStepName }: ProgressProps ) {
	const stepEntries = Object.entries( steps );
	const currentStepIndex = stepEntries.findIndex( ( [ slug ] ) => slug === currentStepName );

	if ( stepEntries.length === 0 ) {
		return null;
	}

	return (
		<HStack spacing={ 4 } justify="flex-start" alignment="left" expanded={ false }>
			{ stepEntries.map( ( [ slug, name ], index ) => {
				const isCompleted = index < currentStepIndex;
				const isCurrent = index === currentStepIndex;

				return (
					<HStack
						className="progress-step"
						key={ slug }
						spacing={ 2 }
						justify="flex-start"
						expanded={ false }
					>
						<div
							className={ clsx( 'progress-step__circle', {
								'progress-step__circle--completed': isCompleted,
								'progress-step__circle--current': isCurrent,
							} ) }
						>
							{ isCompleted ? <Icon icon={ check } size={ 20 } /> : index + 1 }
						</div>
						<Text
							className={ clsx( 'progress-step__label', {
								'progress-step__label--current': isCurrent,
							} ) }
						>
							{ name }
						</Text>
					</HStack>
				);
			} ) }
		</HStack>
	);
}
