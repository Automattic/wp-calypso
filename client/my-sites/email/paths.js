/** @format */

/**
 * External dependencies
 */
import { filter, startsWith } from 'lodash';

export function emailManagementAddGSuiteUsers( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'add-gsuite-users' );
	} else {
		path = '/email/add-gsuite-users/' + siteName;
	}

	return path;
}

export function emailManagement( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'email' );
	} else if ( siteName ) {
		path = '/email/' + siteName;
	} else {
		path = '/email';
	}

	return path;
}

export function emailManagementForwarding( siteName, domainName ) {
	return emailManagementEdit( siteName, domainName, 'email-forwarding' );
}

export function emailManagementEdit( siteName, domainName, slug ) {
	slug = slug || 'edit';

	// Encodes only real domain names and not parameter placeholders
	if ( ! startsWith( domainName, ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	return '/email/' + domainName + '/' + slug + '/' + siteName;
}
