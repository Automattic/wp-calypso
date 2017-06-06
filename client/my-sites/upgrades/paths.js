/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';
import filter from 'lodash/filter';

function domainManagementRoot() {
	return '/domains/manage';
}

function domainManagementList( siteName ) {
	return domainManagementRoot() + '/' + siteName;
}

function domainManagementEdit( siteName, domainName, slug ) {
	slug = slug || 'edit';

	// Encodes only real domain names and not parameter placeholders
	if ( ! startsWith( domainName, ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domainName = encodeURIComponent( encodeURIComponent( domainName ) );
	}

	return domainManagementRoot() + '/' + domainName + '/' + slug + '/' + siteName;
}

function domainManagementAddGoogleApps( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = domainManagementEdit( siteName, domainName, 'add-google-apps' );
	} else {
		path = domainManagementRoot() + '/add-google-apps/' + siteName;
	}

	return path;
}

function domainManagementContactsPrivacy( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'contacts-privacy' );
}

function domainManagementEditContactInfo( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'edit-contact-info' );
}

function domainManagementEmail( siteName, domainName ) {
	let path;

	if ( domainName ) {
		path = domainManagementEdit( siteName, domainName, 'email' );
	} else if ( siteName ) {
		path = domainManagementRoot() + '/email/' + siteName;
	} else {
		path = domainManagementRoot() + '/email';
	}

	return path;
}

function domainManagementEmailForwarding( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'email-forwarding' );
}

function domainManagementNameServers( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'name-servers' );
}

function domainManagementDns( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'dns' );
}

function domainManagementPrivacyProtection( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'privacy-protection' );
}

function domainManagementRedirectSettings( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'redirect-settings' );
}

function domainManagementPrimaryDomain( siteName, domainName ) {
	return domainManagementEdit( siteName, domainName, 'primary-domain' );
}

function domainManagementTransfer( siteName, domainName, transferType = '' ) {
	return domainManagementEdit( siteName, domainName, filter( [ 'transfer', transferType ] ).join( '/' ) );
}

function domainManagementTransferOut( siteName, domainName ) {
	return domainManagementTransfer( siteName, domainName, 'out' );
}

function domainManagementTransferToAnotherUser( siteName, domainName ) {
	return domainManagementTransfer( siteName, domainName, 'other-user' );
}

function getSectionName( pathname ) {
	const regExp = new RegExp( '^' + domainManagementRoot() + '/[^/]+/([^/]+)', 'g' ),
		matches = regExp.exec( pathname );

	return matches ? matches[ 1 ] : null;
}

module.exports = {
	domainManagementAddGoogleApps,
	domainManagementContactsPrivacy,
	domainManagementDns,
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementEmail,
	domainManagementEmailForwarding,
	domainManagementList,
	domainManagementNameServers,
	domainManagementPrimaryDomain,
	domainManagementPrivacyProtection,
	domainManagementRedirectSettings,
	domainManagementRoot,
	domainManagementTransfer,
	domainManagementTransferOut,
	domainManagementTransferToAnotherUser,
	getSectionName
};
