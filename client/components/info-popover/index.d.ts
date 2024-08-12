import { FC, PropsWithChildren } from 'react';

interface InfoPopoverProps {
	icon: string;
	position: string;
	iconSize: number;
	showOnHover: boolean;
}

const InfoPopover: FC< PropsWithChildren< InfoPopoverProps > >;

export default InfoPopover;
