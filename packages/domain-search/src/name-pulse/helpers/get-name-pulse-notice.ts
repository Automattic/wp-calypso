import { DomainAvailabilityStatus, type DomainAvailability } from '@automattic/api-core';
import { __, sprintf } from '@wordpress/i18n';
import type { NamePulseResultsLayout } from './get-results-layout';

export type NamePulseAvailabilityVerdict = Pick<
	DomainAvailability,
	'status' | 'domain_name' | 'tld'
>;

export interface NamePulseNotice {
	status: 'warning' | 'neutral' | 'error';
	message: string;
	/** Set when the domain is registered elsewhere and could be brought over. */
	transferDomain?: string;
	/** Only the notices about how the query was read. */
	dismissible?: true;
}

const REGISTERED_ELSEWHERE = [
	DomainAvailabilityStatus.TRANSFERRABLE,
	DomainAvailabilityStatus.TRANSFERRABLE_PREMIUM,
];

const OWNED_BY_USER = [
	DomainAvailabilityStatus.REGISTERED_SAME_SITE,
	DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
];

// `registered_domain` means registered *with* WordPress.com, not elsewhere.
// MAPPED_SAME_SITE_REGISTRABLE is left out: it is still registrable here.
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
			status: 'neutral',
			message: __( 'This domain is already registered.' ),
			transferDomain: verdict.domain_name,
		};
	}

	if ( OWNED_BY_USER.includes( verdict.status ) ) {
		return { status: 'neutral', message: __( 'You already own this domain.' ) };
	}

	if ( CONNECTED_TO_WPCOM.includes( verdict.status ) ) {
		return {
			status: 'error',
			message: __( 'This domain is already connected to a WordPress.com site.' ),
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
			status: 'warning',
			dismissible: true,
			message: __(
				'We don’t recognise that ending. Try .com or .blog, or enter just the name and we’ll suggest the rest.'
			),
		};
	}

	if ( layout.issue.type === 'subdomain' ) {
		return {
			status: 'warning',
			dismissible: true,
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
		status: 'warning',
		dismissible: true,
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
 * A verdict on the domain being shown outranks an explanation of how the query
 * was read, so a registered root domain wins over "we dropped the subdomain".
 */
export function getNamePulseNotice(
	layout: NamePulseResultsLayout,
	availability?: NamePulseAvailabilityVerdict
): NamePulseNotice | null {
	const verdictNotice = availability ? fromAvailability( availability ) : null;

	return verdictNotice ?? fromQueryShape( layout );
}
