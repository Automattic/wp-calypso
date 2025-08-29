import { __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { check } from '@wordpress/icons';
import type { ProgressStepList, StepSlug } from '../types';

interface ProgressProps {
	steps: ProgressStepList;
	currentStep: StepSlug;
}

export default function Progress( { steps, currentStep }: ProgressProps ) {
	const stepEntries = Object.entries( steps );
	const currentStepIndex = stepEntries.findIndex( ( [ slug ] ) => slug === currentStep );

	if ( stepEntries.length === 0 ) {
		return null;
	}

	return (
		<HStack spacing={ 4 } justify="flex-start" alignment="left" expanded={ false }>
			{ stepEntries.map( ( [ slug, name ], index ) => {
				const isCompleted = index < currentStepIndex;
				const isCurrent = index === currentStepIndex;

				let selectedStyle = {
					backgroundColor: 'transparent',
					borderColor: '#ddd',
					color: '#666',
				};

				if ( isCompleted ) {
					selectedStyle = {
						backgroundColor: '#007CBA',
						borderColor: '#007CBA',
						color: '#fff',
					};
				} else if ( isCurrent ) {
					selectedStyle = {
						backgroundColor: '#007CBA',
						borderColor: '#007CBA',
						color: '#fff',
					};
				}

				return (
					<HStack key={ slug } spacing={ 2 } justify="flex-start" expanded={ false }>
						<div
							style={ {
								width: '24px',
								height: '24px',
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: '12px',
								fontWeight: 500,
								border: '1px solid',
								...selectedStyle,
							} }
						>
							{ isCompleted ? <Icon icon={ check } size={ 14 } /> : index + 1 }
						</div>
						<span
							style={ {
								color: isCurrent ? '#000' : '#666',
							} }
						>
							{ name }
						</span>
					</HStack>
				);
			} ) }
		</HStack>
	);
}
