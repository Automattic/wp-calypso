import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';
import { domainAddNew } from 'calypso/my-sites/domains/paths';

export function getAvailabilityErrorMessage( { availabilityData, domainName, selectedSite } ) {
	const { status, mappable, maintenance_end_time, other_site_domain } = availabilityData;

	if ( domainAvailability.AVAILABLE === status ) {
		if ( selectedSite ) {
			const searchPageLink = domainAddNew( selectedSite.slug, domainName );
			return createInterpolateElement(
				__( "This domain isn't registered. Did you mean to <a>search for a domain</a> instead?" ),
				{
					a: createElement( 'a', { href: searchPageLink } ),
				}
			);
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

	const availabilityStatus = [
		domainAvailability.MAPPABLE,
		domainAvailability.MAPPED,
		domainAvailability.TRANSFER_PENDING,
	].includes( mappable )
		? status
		: mappable;
	const maintenanceEndTime = maintenance_end_time ?? null;
	const site = other_site_domain ?? selectedSite.slug;

	const errorData = getAvailabilityNotice( domainName, availabilityStatus, {
		site,
		maintenanceEndTime,
	} );
	return errorData?.message || null;
}
