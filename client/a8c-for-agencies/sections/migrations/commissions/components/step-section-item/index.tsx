import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import clsx from 'clsx';
import React from 'react';

import './style.scss';

interface StepSectionItemProps {
	heading: string;
	description: React.ReactNode;
	className?: string;
	children?: React.ReactNode;
}

export default function StepSectionItem( {
	heading,
	description,
	className,
	children,
}: StepSectionItemProps ) {
	return (
		<div className={ clsx( 'commissions-step-section-item', className ) }>
			<VStack className="commissions-step-section-item-content" spacing={ 1 }>
				<Text
					className="commissions-step-section-item-heading"
					size={ 15 }
					weight={ 500 }
					lineHeight="20px"
				>
					{ heading }
				</Text>
				<div className="commissions-step-section-item-description">{ description }</div>
			</VStack>
			{ children }
		</div>
	);
}
