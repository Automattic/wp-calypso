// @ts-nocheck - TODO: Fix TypeScript issues
import { ResponseDomain } from 'calypso/lib/domains/types';
import { getEligibleTitanDomain } from '..';

describe( 'getEligibleTitanDomain()', () => {
	test( 'return null when domains are undefined', () => {
		expect( getEligibleTitanDomain( 'foo.bar', undefined ) ).toBeNull();
	} );

	test( 'return null when domains are empty', () => {
		expect( getEligibleTitanDomain( 'foo.bar', [] ) ).toBeNull();
	} );

	test( 'return null with domain with G Suite', () => {
		expect(
			getEligibleTitanDomain( 'foo.bar', [
				{
					name: 'domain-with-gsuite.com',
					currentUserCanAddEmail: true,
					googleAppsSubscription: { status: 'active' },
				},
			] as ResponseDomain[] )
		).toBeNull();
	} );

	test( 'return null with domain with Titan', () => {
		expect(
			getEligibleTitanDomain( 'foo.bar', [
				{
					name: 'domain-with-titan.com',
					currentUserCanAddEmail: true,
					titanMailSubscription: { status: 'active' },
				},
			] as ResponseDomain[] )
		).toBeNull();
	} );

	test( 'return null with expired domain', () => {
		expect(
			getEligibleTitanDomain( 'foo.bar', [
				{
					name: 'domain-expired.com',
					currentUserCanAddEmail: true,
					expired: true,
				},
			] as ResponseDomain[] )
		).toBeNull();
	} );

	test( 'return null with staging domain', () => {
		expect(
			getEligibleTitanDomain( 'foo.bar', [
				{
					name: 'invalid.wpcomstaging.com',
					currentUserCanAddEmail: true,
					isWpcomStagingDomain: true,
				},
			] as ResponseDomain[] )
		).toBeNull();
	} );

	test( 'return null when user cannot add email', () => {
		expect(
			getEligibleTitanDomain( 'foo.bar', [
				{
					name: 'domain.com',
					currentUserCanAddEmail: false,
				},
			] as ResponseDomain[] )
		).toBeNull();
	} );

	test( 'return domain when eligible', () => {
		const domain = {
			name: 'domain-eligible.com',
			currentUserCanAddEmail: true,
		} as ResponseDomain;

		expect( getEligibleTitanDomain( 'foo.bar', [ domain ] ) ).toBe( domain );
	} );

	test( 'return primary domain instead of other eligible domains', () => {
		const domain = {
			name: 'domain-eligible-primary.com',
			currentUserCanAddEmail: true,
			isPrimary: true,
		};

		const domains = [
			{
				name: 'domain-eligible.com',
				currentUserCanAddEmail: true,
			},
			domain,
		] as ResponseDomain[];

		expect( getEligibleTitanDomain( 'foo.bar', domains ) ).toBe( domain );
	} );

	test( 'return selected domain instead of other eligible domains', () => {
		const domain = {
			name: 'domain-eligible-selected.com',
			currentUserCanAddEmail: true,
		};

		const domains = [
			{
				name: 'domain-eligible.com',
				currentUserCanAddEmail: true,
			},
			{
				name: 'domain-eligible-primary.com',
				currentUserCanAddEmail: true,
				isPrimary: true,
			},
			domain,
		] as ResponseDomain[];

		expect( getEligibleTitanDomain( 'domain-eligible-selected.com', domains ) ).toBe( domain );
	} );

	test( 'return first domain instead of other eligible domains when selected domain differs', () => {
		const domain = {
			name: 'domain-eligible.com',
			currentUserCanAddEmail: true,
		};

		const domains = [
			domain,
			{
				name: 'another-domain-eligible.com',
				currentUserCanAddEmail: true,
			},
			{
				name: 'foo.bar',
				currentUserCanAddEmail: true,
			},
		] as ResponseDomain[];

		expect( getEligibleTitanDomain( 'bar.bar', domains ) ).toBe( domain );
	} );

	test( 'return primary domain eligible for introductory offer instead of other eligible domains', () => {
		const domain = {
			name: 'domain-eligible-primary.com',
			currentUserCanAddEmail: true,
			isPrimary: true,
			titanMailSubscription: { isEligibleForIntroductoryOffer: true },
		};

		const domains = [
			{
				name: 'domain-eligible.com',
				currentUserCanAddEmail: true,
				titanMailSubscription: { isEligibleForIntroductoryOffer: true },
			},
			{
				name: 'another-domain-eligible.com',
				currentUserCanAddEmail: true,
				titanMailSubscription: { isEligibleForIntroductoryOffer: false },
			},
			domain,
		] as ResponseDomain[];

		expect( getEligibleTitanDomain( 'foo.bar', domains, true ) ).toBe( domain );
	} );

	test( 'return most recent non-primary domain eligible first', () => {
		const domain = {
			name: 'domain-eligible-most-recent.com',
			currentUserCanAddEmail: true,
			registrationDate: '2021-03-25T10:58:17+00:00',
		};

		const domains = [
			{
				name: 'domain-eligible.com',
				currentUserCanAddEmail: true,
				registrationDate: '2021-01-25T17:53:49+00:00',
			},
			{
				name: 'another-domain-eligible.com',
				currentUserCanAddEmail: true,
				registrationDate: '2021-01-26T14:14:43+00:00',
			},
			domain,
		] as ResponseDomain[];

		expect( getEligibleTitanDomain( 'foo.bar', domains ) ).toBe( domain );
	} );

	test( 'return primary domain eligible instead of most recent eligible domains', () => {
		const domain = {
			name: 'domain-eligible-primary.com',
			currentUserCanAddEmail: true,
			registrationDate: '2020-06-01T11:48:49+00:00',
			isPrimary: true,
		};

		const domains = [
			{
				name: 'domain-eligible.com',
				currentUserCanAddEmail: true,
				registrationDate: '2021-01-25T17:53:49+00:00',
			},
			{
				name: 'domain-eligible-most-recent.com',
				currentUserCanAddEmail: true,
				registrationDate: '2021-03-25T10:58:17+00:00',
			},
			domain,
		] as ResponseDomain[];

		expect( getEligibleTitanDomain( 'foo.bar', domains ) ).toBe( domain );
	} );
} );
