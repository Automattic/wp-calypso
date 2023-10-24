# Domain Management

This folder contains components specific to the `/domains/manage` routes.

Supported routes:

- `/domains/manage` - entry point for domains management
- `/domains/manage/:site` - lists domains for a site
- `/domains/manage/:domain/dns/:site` - manages DNS records for a domain
- `/domains/manage/:domain/add-dns-record/:site` - add new DNS record for a domain
- `/domains/manage/:domain/edit-dns-record/:site` - update DNS record for a domain
- `/domains/manage/:domain/edit/:site` - displays domain details
- `/domains/manage/:domain/edit-contact-info/:site` - manages contact information for a domain
- `/domains/manage/:domain/name-servers/:site` - manages name servers for a domain
- `/domains/manage/:domain/primary-domain/:site` - changes primary domain for a site
- `/domains/manage/:domain/redirect-settings/:site` - changes redirect settings for a domain
- `/domains/manage/:domain/transfer/:site` - allows transfer domain to the different hosting provider
