import { Reader } from '@automattic/data-stores';
import React from 'react';

type SiteSubscriptionContextProps = {
	subscription: SiteSubscription | null;
	setSubscription: React.Dispatch< React.SetStateAction< SiteSubscription | null > >;
};

const SiteSubscriptionContext = React.createContext< SiteSubscriptionContextProps | undefined >(
	undefined
);

export type SiteSubscription = {
	id: string;
	blogId: string;
	feedId: string;
	url: string;
	dateSubscribed: Date;
	deliveryMethods: Reader.SiteSubscriptionDeliveryMethods;
	name: string;
	organizationId: number;
	unseenCount: number;
	lastUpdated: Date;
	siteIcon: string;
	isOwner: boolean;
	meta: Reader.SiteSubscriptionMeta;
	isWpForTeamsSite: boolean;
	isPaidSubscription: boolean;
	isDeleted: boolean;
};

type SiteSubscriptionProviderProps = {
	subscription: SiteSubscription;
	children: React.ReactNode;
};

export const SiteSubscriptionProvider: React.FC< SiteSubscriptionProviderProps > = ( {
	subscription,
	children,
} ) => {
	const [ currentSubscription, setSubscription ] = React.useState< SiteSubscription | null >(
		subscription
	);

	return (
		<SiteSubscriptionContext.Provider
			value={ { subscription: currentSubscription, setSubscription } }
		>
			{ children }
		</SiteSubscriptionContext.Provider>
	);
};
