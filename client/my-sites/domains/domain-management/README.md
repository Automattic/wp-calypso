Domain Management
=================

This folder contains components specific to the `/domains/manage` routes.

Supported routes:

- `/domains/manage` - entry point for domains management
- `/domains/manage/:site` - lists domains for a site
- `/domains/manage/:site/add-google-apps` - adds Google Apps for a site
- `/domains/manage/:domain/add-google-apps/:site` - adds Google Apps for a domain
- `/domains/manage/:domain/contacts-privacy/:site` - displays contacts and privacy information for a domain
- `/domains/manage/:domain/dns/:site` - manages DNS records for a domain
- `/domains/manage/:domain/edit/:site` - displays domain details
- `/domains/manage/:domain/edit-contact-info/:site` - manages contact information for a domain
- `/domains/manage/:domain/email-forwarding/:site` - manages email forwarding information for a domain
- `/domains/manage/:domain/name-servers/:site` - manages name servers for a domain
- `/domains/manage/:domain/primary-domain/:site` - changes primary domain for a site
- `/domains/manage/:domain/privacy-protection/:site` - adds privacy protection for a domain
- `/domains/manage/:domain/redirect-settings/:site` - changes redirect settings for a domain
- `/domains/manage/:domain/transfer/:site` - allows transfer domain to the different hosting provider
