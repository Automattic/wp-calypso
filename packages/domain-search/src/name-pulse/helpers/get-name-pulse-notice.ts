import { DomainAvailabilityStatus, type DomainAvailability } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import type { NamePulseResultsLayout } from './get-results-layout';

/**
 * The fields of a real-time availability check the notice depends on.
 */
export type NamePulseAvailabilityVerdict = Pick<
	DomainAvailability,
	'status' | 'domain_name' | 'tld'
>;

export interface NamePulseNotice {
	status: 'error' | 'info';
	message: string;
	/**
	 * Set when the domain is registered elsewhere and could be brought over.
	 */
	transferDomain?: string;
}

const REGISTERED_ELSEWHERE = [
	DomainAvailabilityStatus.TRANSFERRABLE,
	DomainAvailabilityStatus.TRANSFERRABLE_PREMIUM,
];

const OWNED_BY_USER = [
	DomainAvailabilityStatus.REGISTERED_SAME_SITE,
	DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
];

// `registered_domain` means registered *with* WordPress.com, which is why both
// the classic flow and this one describe it as connected rather than offering
// to bring it over. MAPPED_SAME_SITE_REGISTRABLE is left out: the domain is
// connected but the user can still register it here, so the search result is
// the useful answer.
const CONNECTED_TO_WPCOM = [
	DomainAvailabilityStatus.REGISTERED,
	DomainAvailabilityStatus.MAPPED,
	DomainAvailabilityStatus.MAPPED_SAME_SITE_TRANSFERRABLE,
	DomainAvailabilityStatus.MAPPED_SAME_SITE_NOT_TRANSFERRABLE,
	DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER,
	DomainAvailabilityStatus.MAPPED_OTHER_SITE_SAME_USER_REGISTRABLE,
];

const UNSUPPORTED_ENDING = [
	DomainAvailabilityStatus.INVALID_TLD,
	DomainAvailabilityStatus.TLD_NOT_SUPPORTED,
	DomainAvailabilityStatus.TLD_NOT_SUPPORTED_AND_DOMAIN_NOT_AVAILABLE,
	DomainAvailabilityStatus.TLD_NOT_SUPPORTED_TEMPORARILY,
];

function fromAvailability( verdict: NamePulseAvailabilityVerdict ): NamePulseNotice | null {
	if ( REGISTERED_ELSEWHERE.includes( verdict.status ) ) {
		return {
			status: 'error',
			message: __( 'This domain is already registered.' ),
			transferDomain: verdict.domain_name,
		};
	}

	if ( OWNED_BY_USER.includes( verdict.status ) ) {
		return { status: 'info', message: __( 'You already own this domain.' ) };
	}

	if ( CONNECTED_TO_WPCOM.includes( verdict.status ) ) {
		return {
			status: 'error',
			message: __( 'This domain is already connected to a WordPress.com site.' ),
		};
	}

	if ( verdict.status === DomainAvailabilityStatus.DISALLOWED ) {
		return {
			status: 'error',
			message: __(
				'Due to trademark policy, domains containing “WordPress” cannot be registered here. Please contact support if you have any questions.'
			),
		};
	}

	if ( verdict.status === DomainAvailabilityStatus.RESTRICTED ) {
		return {
			status: 'error',
			message: __( 'This is a free WordPress.com subdomain. You can’t map it to another site.' ),
		};
	}

	if ( UNSUPPORTED_ENDING.includes( verdict.status ) ) {
		return {
			status: 'error',
			message: sprintf(
				// translators: %(tld)s is a domain ending, such as "com".
				__( '.%(tld)s domains are not available for registration on WordPress.com.' ),
				{ tld: verdict.tld }
			),
		};
	}

	return null;
}

function fromQueryShape( layout: NamePulseResultsLayout ): NamePulseNotice | null {
	if ( ! layout.issue ) {
		return null;
	}

	if ( layout.issue.type === 'unknown-tld' ) {
		return {
			status: 'info',
			message: sprintf(
				// translators: %(ending)s is the unrecognised ending the user typed, %(name)s is the name searched instead.
				__( 'We don’t recognise the ending .%(ending)s. Showing results for “%(name)s” instead.' ),
				{ ending: layout.issue.ending, name: layout.baseName }
			),
		};
	}

	if ( layout.issue.type === 'subdomain' ) {
		return {
			status: 'info',
			message: sprintf(
				// translators: %(domain)s is the domain searched instead, without the subdomain.
				__(
					'Domains are registered without a subdomain. Showing results for “%(domain)s” instead.'
				),
				{ domain: layout.issue.rootDomain }
			),
		};
	}

	return {
		status: 'info',
		message: sprintf(
			// translators: %(name)s is the name searched instead of the free subdomain.
			__(
				'That’s a free WordPress.com subdomain, not a domain you can register. Showing results for “%(name)s” instead.'
			),
			{ name: layout.baseName }
		),
	};
}

/**
 * The single notice shown above the results. A verdict on the domain the user
 * is actually being shown outranks an explanation of how the query was read,
 * so a registered root domain wins over "we dropped the subdomain".
 */
export function getNamePulseNotice(
	layout: NamePulseResultsLayout,
	availability?: NamePulseAvailabilityVerdict
): NamePulseNotice | null {
	return ( availability && fromAvailability( availability ) ) || fromQueryShape( layout );
}
