import type { ReactNode } from 'react';

export type HostingDetailsItem = {
	title: string;
	description: string | ReactNode;
	icon: JSX.Element;
};

export type HostingDetails = {
	[ key: string ]: HostingDetailsItem;
};

export type UpgradePlanDetailsProps = {
	siteId: number;
	children: React.ReactNode;
};
