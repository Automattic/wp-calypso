import { translate } from 'i18n-calypso';
import {
	domainManagementEditContactInfo,
	domainManagementRoot,
} from 'calypso/my-sites/domains/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export function getAccountSettingsSuccessNotice( response, ownedDomains ) {
	const newEmail = response.new_user_email;
	const moreThanEmailChanged = Object.keys( response )?.find(
		( item ) => ! [ 'new_user_email', 'user_email', 'user_email_change_pending' ].includes( item )
	);

	// Determine how many domains user has for the link to update the contact email for domain
	const domainCount = ownedDomains.length;
	const firstDomain = domainCount === 1 ? ownedDomains[ 0 ] : null;

	// Default case
	let successMessage = translate( 'Settings saved successfully!' );

	if ( newEmail && moreThanEmailChanged ) {
		// Email and other settings changed
		if ( domainCount === 0 ) {
			// User does not have any domains
			successMessage = translate(
				'Settings saved successfully!{{br/}}We sent an email to %(email)s. Please check your inbox to verify your email.',
				{
					args: {
						email: newEmail || '',
					},
					components: {
						br: <br />,
					},
				}
			);
		} else if ( domainCount === 1 && firstDomain ) {
			// User has one domain
			successMessage = translate(
				'Settings saved successfully!{{br/}}We sent an email to %(email)s. Please check your inbox to verify your email.{{br/}}Since you own a custom domain, please consider updating its {{a}}contact email{{/a}} to match your new email address.',
				{
					args: {
						email: newEmail || '',
					},
					components: {
						br: <br />,
						a: (
							<a
								href={ domainManagementEditContactInfo( firstDomain.siteSlug, firstDomain.domain ) }
								onClick={ () => {
									recordTracksEvent( 'calypso_domain_contact_email_update_notice_click', {
										link_text: 'contact email',
										domain: firstDomain.domain,
									} );
								} }
							/>
						),
					},
				}
			);
		} else {
			// User has multiple domains
			successMessage = translate(
				'Settings saved successfully!{{br/}}We sent an email to %(email)s. Please check your inbox to verify your email.{{br/}}Since you own multiple custom domains, please consider updating {{a}}contact email{{/a}} for these domains to match your new email address.',
				{
					args: {
						email: newEmail || '',
					},
					components: {
						br: <br />,
						a: (
							<a
								href={ domainManagementRoot() }
								onClick={ () => {
									recordTracksEvent( 'calypso_domain_contact_email_update_notice_click', {
										link_text: 'contact email',
										domain: null,
									} );
								} }
							/>
						),
					},
				}
			);
		}
	} else if ( newEmail ) {
		// Only email changed
		if ( domainCount === 0 ) {
			successMessage = translate(
				'We sent an email to %(email)s. Please check your inbox to verify your email.',
				{
					args: {
						email: newEmail || '',
					},
				}
			);
		} else if ( domainCount === 1 ) {
			successMessage = translate(
				'We sent an email to %(email)s.{{br/}}Since you own a custom domain, please consider updating its {{a}}contact email{{/a}} to match your new email address.',
				{
					args: {
						email: newEmail || '',
					},
					components: {
						br: <br />,
						a: (
							<a
								href={ domainManagementEditContactInfo( firstDomain.siteSlug, firstDomain.domain ) }
								onClick={ () => {
									recordTracksEvent( 'calypso_domain_contact_email_update_notice_click', {
										link_text: 'contact email',
										domain: firstDomain.domain,
									} );
								} }
							/>
						),
					},
				}
			);
		} else {
			successMessage = translate(
				'We sent an email to %(email)s. Please check your inbox to verify your email.{{br/}}Since you own multiple custom domains, please consider updating {{a}}contact email{{/a}} for these domains to match your new email address.',
				{
					args: {
						email: newEmail || '',
					},
					components: {
						br: <br />,
						a: (
							<a
								href={ domainManagementRoot() }
								onClick={ () => {
									recordTracksEvent( 'calypso_domain_contact_email_update_notice_click', {
										link_text: 'contact email',
										domain: null,
									} );
								} }
							/>
						),
					},
				}
			);
		}
	}

	return successMessage;
}
