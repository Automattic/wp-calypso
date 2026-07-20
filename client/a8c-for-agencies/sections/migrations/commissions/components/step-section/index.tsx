import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
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
		<VStack className={ clsx( 'commissions-step-section', className ) } spacing={ 4 }>
			<HStack
				className="commissions-step-section-header"
				alignment="center"
				justify="flex-start"
				spacing={ 4 }
			>
				{ !! stepCount && <div className="commissions-step-section-step-count">{ stepCount }</div> }
				<Text
					className="commissions-step-section-heading"
					size={ 15 }
					weight={ 500 }
					lineHeight="20px"
				>
					{ heading }
				</Text>
			</HStack>
			<VStack className="commissions-step-section-content" spacing={ 4 }>
				{ children }
			</VStack>
		</VStack>
	);
}
