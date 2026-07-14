import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import clsx from 'clsx';
import React from 'react';

import './style.scss';

interface StepSectionProps {
	heading: string;
	stepCount?: number;
	children: React.ReactNode;
	className?: string;
}

export default function StepSection( {
	stepCount,
	heading,
	children,
	className,
}: StepSectionProps ) {
	return (
		<div className={ clsx( 'commissions-step-section', className ) }>
			<HStack className="commissions-step-section-header" alignment="center" justify="flex-start">
				{ !! stepCount && <div className="commissions-step-section-step-count">{ stepCount }</div> }
				<Text className="commissions-step-section-heading">{ heading }</Text>
			</HStack>
			<div className="commissions-step-section-content">{ children }</div>
		</div>
	);
}
