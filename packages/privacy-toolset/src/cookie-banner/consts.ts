import { Buckets } from './types';

export const allBucketsTrue: Buckets = {
	essential: true,
	analytics: true,
	advertising: true,
};

export const essentialOnly: Buckets = {
	essential: true,
	analytics: false,
	advertising: false,
};

export const defaultBuckets: Buckets = {
	essential: true,
	analytics: true,
	advertising: false,
};
