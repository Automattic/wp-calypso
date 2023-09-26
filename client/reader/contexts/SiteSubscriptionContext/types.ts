import { Reader } from '@automattic/data-stores';

export type SiteSubscriptionDeliveryMethods = {
	email?: {
		sendPosts: boolean;
		sendComments?: boolean;
		postDeliverFrequency?: Reader.EmailDeliveryFrequency;
		dateSubscribed?: Date;
	};
	notification?: {
		sendPosts: boolean;
	};
};

export type SiteSubscriptionPaymentDetails = {
	id: number;
	siteId: number;
	status: string;
	startDate: string;
	endDate: string;
	renewInterval: string;
	renewalPrice: string;
	currency: string;
	productId: string;
	title: string;
};

// SiteSubscription is a union of the types returned by the Reader.SiteSubscription and Reader.SiteSubscriptionDetails.
export type SiteSubscription = {
	id: number;
	blogId?: number;
	feedId?: number;
	name: string;
	url: string;
	siteIcon: string | null;
	dateSubscribed: string;
	deliveryMethods: SiteSubscriptionDeliveryMethods;
	subscriberCount?: number;
	paymentDetails?: SiteSubscriptionPaymentDetails[];
	organizationId?: number;
	unseenCount?: number;
	lastUpdated?: Date;
	isOwner?: boolean;
	meta?: Reader.SiteSubscriptionMeta;
	isWpForTeamsSite?: boolean;
	isPaidSubscription?: boolean;
	isDeleted?: boolean;
};
