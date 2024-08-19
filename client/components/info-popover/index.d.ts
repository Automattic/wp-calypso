import { FC, PropsWithChildren } from 'react';

interface InfoPopoverProps {
	icon?: string;
	position?: string;
	iconSize?: number;
	showOnHover?: boolean;
	screenReaderText?: string;
	className?: string;
	onOpen?: () => void;
}

const InfoPopover: FC< PropsWithChildren< InfoPopoverProps > >;

export default InfoPopover;
