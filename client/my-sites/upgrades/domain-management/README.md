Domain Management
=================

This folder contains components specific to the `/domains/manage` routes.

Supported routes:

- `/domains/manage` - entry point for domains management
- `/domains/manage/:site` - lists domains for a site
- `/domains/manage/:site/add-google-apps` - adds Google Apps for a site
- `/domains/manage/:site/add-google-apps/:domain` - adds Google Apps for a domain
- `/domains/manage/:site/contacts-privacy/:domain` - displays contacts and privacy information for a domain
- `/domains/manage/:site/dns/:domain` - manages DNS records for a domain
- `/domains/manage/:site/edit/:domain` - displays domain details
- `/domains/manage/:site/edit-contact-info/:domain` - manages contact information for a domain
- `/domains/manage/:site/email-forwarding/:domain` - manages email forwarding information for a domain
- `/domains/manage/:site/name-servers/:domain` - manages name servers for a domain
- `/domains/manage/:site/primary-domain/:domain` - changes primary domain for a site
- `/domains/manage/:site/privacy-protection/:domain` - adds privacy protection for a domain
- `/domains/manage/:site/redirect-settings/:domain` - changes redirect settings for a domain
- `/domains/manage/:site/transfer/:domain` - allows transfer domain to the different hosting provider
