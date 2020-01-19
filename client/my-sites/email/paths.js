/**
 * External dependencies
 */
import { startsWith } from 'lodash';

export function emailManagementAddGSuiteUsers( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'gsuite/add-users' );
	} else {
		path = '/email/gsuite/add-users/' + siteName;
	}

	return path;
}

export function emailManagementAddGSuiteUsersLegacy( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'add-gsuite-users' );
	} else {
		path = '/email/add-gsuite-users/' + siteName;
	}

	return path;
}

export function emailManagementNewGSuiteAccount( siteName, domainName, planType ) {
	return emailManagementEdit( siteName, domainName, 'gsuite/new/' + planType );
}

export function emailManagement( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = emailManagementEdit( siteName, domainName, 'manage' );
	} else if ( siteName ) {
		path = '/email/' + siteName;
	} else {
		path = '/email';
	}

	return path;
}

export function emailManagementForwarding( siteName, domainName ) {
	return emailManagementEdit( siteName, domainName, 'forwarding' );
}

export function emailManagementEdit( siteName, domainName, slug ) {
	slug = slug || 'manage';

	// Encodes only real domain names and not parameter placeholders
	if ( ! startsWith( domainName, ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	return '/email/' + domainName + '/' + slug + '/' + siteName;
}
