import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';
import { domainAddNew } from 'calypso/my-sites/domains/paths';

export function getAvailabilityErrorMessage( {
	availabilityData,
	domainName,
	selectedSite,
	registerNowAction = undefined,
} ) {
	const { status, mappable, maintenance_end_time, other_site_domain, other_site_domain_only } =
		availabilityData;

	if ( [ status, mappable ].includes( domainAvailability.AVAILABLE ) ) {
		if ( selectedSite ) {
			const searchPageLink = domainAddNew( selectedSite.slug, domainName );
			return createInterpolateElement(
				__( "This domain isn't registered. Did you mean to <a>search for a domain</a> instead?" ),
				{
					a: createElement( 'a', { href: searchPageLink } ),
				}
			);
		}

		if ( registerNowAction && status !== domainAvailability.TLD_NOT_SUPPORTED ) {
			return createInterpolateElement( __( "This domain isn't registered. <a>Register now.</a>" ), {
				a: createElement( 'a', {
					href: '#',
					onClick: ( event ) => {
						event.preventDefault();
						registerNowAction();
					},
				} ),
			} );
		}

		return __( "This domain isn't registered. Try again." );
	}

	const isMappable = domainAvailability.MAPPABLE === mappable;
	const isTransferable = [
		domainAvailability.TRANSFERRABLE,
		domainAvailability.MAPPED_SAME_SITE_TRANSFERRABLE,
	].includes( status );
	const isError = [
		domainAvailability.AVAILABILITY_CHECK_ERROR,
		domainAvailability.UNKNOWN,
	].includes( status );

	if ( ( isMappable || isTransferable ) && ! isError ) {
		return null;
	}

	let availabilityStatus = [
		domainAvailability.MAPPABLE,
		domainAvailability.MAPPED,
		domainAvailability.TRANSFER_PENDING,
	].includes( mappable )
		? status
		: mappable;

	if ( domainAvailability.MAPPED === mappable && domainAvailability.MAPPABLE === status ) {
		availabilityStatus = mappable;
	}

	const maintenanceEndTime = maintenance_end_time ?? null;
	const site = other_site_domain ?? selectedSite?.slug;
	const isSiteDomainOnly =
		site === other_site_domain ? other_site_domain_only : selectedSite?.options?.is_domain_only;

	const errorData = getAvailabilityNotice( domainName, availabilityStatus, {
		site,
		maintenanceEndTime,
		isSiteDomainOnly,
		cannot_transfer_due_to_unsupported_premium_tld:
			availabilityData?.cannot_transfer_due_to_unsupported_premium_tld,
	} );
	return errorData?.message || null;
}
