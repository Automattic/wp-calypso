// Basic TypeScript types to make SegmentedControl work in the <PlansIntervalToggle> component

/**
 * External dependencies
 */
import * as React from 'react';

interface SegmentedControlProps {
	children: React.ReactNode;
}

interface SegmentedControlItemProps {
	className?: string;
	children: React.ReactNode;
	selected: boolean;
	onClick: () => void;
}

declare const SegmentedControl: React.ComponentType< SegmentedControlProps > & {
	Item: React.ComponentType< SegmentedControlItemProps >;
};

export default SegmentedControl;
