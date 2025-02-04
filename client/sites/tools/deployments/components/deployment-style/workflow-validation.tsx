import { FoldableCard, Spinner } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { check, closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { WorkFlowStates } from './use-check-workflow-query';

export const WorkflowValidation = ( {
	status,
	label,
	children,
}: {
	status: WorkFlowStates;
	label: string;
	children: ReactNode;
} ) => {
	const getValidationIcon = () => {
		if ( status === 'loading' ) {
			return <Spinner className="custom-icons" />;
		}

		return (
			<Icon
				size={ 20 }
				icon={ status === 'success' ? check : closeSmall }
				className={ clsx( 'custom-icons', status ) }
			/>
		);
	};

	return (
		<div>
			<FoldableCard
				className={ status === 'error' ? 'is-error' : '' }
				clickableHeader
				expanded={ false }
				header={
					<>
						{ getValidationIcon() }
						{ label }
					</>
				}
			>
				{ children }
			</FoldableCard>
		</div>
	);
};
