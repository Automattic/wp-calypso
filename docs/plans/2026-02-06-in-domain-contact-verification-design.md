# .in Domain Contact Document Verification

**Linear issue:** DOTOBRD-399
**Date:** 2026-02-06

## Overview

Extend the existing .uk contact verification flow to support .in domains (and future TLDs) across both the Dashboard (MSD) and Calypso (My Sites). Introduces a new generic `contact_document_verification_request` domain flag, a TLD configuration map for dynamic UI copy, and backend changes for post-registration triggers, Zendesk tickets, and emails.

## Acceptance criteria

1. When registering a new .in domain, collect and store the user's additional contact information (any identification document as image/PDF).
2. When the document is collected, create a Zendesk ticket with it (same flow as .uk).
3. For new .in domain purchases, send an email from the domain registration flow asking the customer to open the MSD interface and upload docs.
4. When a user updates the contact information for a .in domain, set the `contact_document_verification_request` flag to `pending`, triggering the document upload flow and email reminder.

## Architecture decisions

- **New generic flag over reusing Nominet flags.** A single optional enum field `contact_document_verification_request` with values `"pending"` and `"suspended"` replaces the two Nominet-specific booleans for new TLDs. Existing Nominet flags remain for backwards compatibility until the backend migrates .uk.
- **TLD configuration map over backend-driven content.** A frontend config maps TLDs to registry info and accepted document lists. Simpler than coordinating backend content delivery, and easy to extend.
- **Same API endpoint.** `POST /domains/{domain}/contact-verification` handles file uploads and Zendesk ticket creation for all TLDs. No new endpoints needed.
- **Email triggered from post-registration async job.** Not from Keysystems webhooks. The `domains-post-register.php` async job (runs ~10 minutes after registration) sets the flag and sends the email.
- **No Keysystems webhook changes for .in.** The existing webhook handler remains .uk-only. For .in, the flag and email are triggered from the post-registration flow and contact info update flow.

---

## Frontend changes

### 1. New shared TLD config

**New file:** `packages/api-core/src/domain-contact-verification/tld-config.ts`

```typescript
interface ContactVerificationTldConfig {
  registryName: string;
  registryDescription: string;
  acceptedDocuments: string[];
}

const contactVerificationTldConfig: Record<string, ContactVerificationTldConfig> = {
  uk: {
    registryName: 'Nominet',
    registryDescription:
      'Nominet, the organization that manages .uk domains, requires us to verify the contact information of your domain.',
    acceptedDocuments: [
      "Valid drivers' license",
      'Valid national ID cards (for non-UK residents)',
      'Utility bills (last 3 months)',
      'Bank statement (last 3 months)',
      'HMRC tax notification (last 3 months)',
    ],
  },
  in: {
    registryName: 'NIXI',
    registryDescription:
      'NIXI, the organization that manages .in domains, requires us to verify the contact information of your domain.',
    acceptedDocuments: [], // Accept any doc for now; update when requirements are finalized
  },
};
```

**Fallback behavior:**
- Unknown TLD: generic copy ("The registry requires us to verify the contact information of your domain.")
- Empty `acceptedDocuments`: show "Please upload a valid identification document." instead of a bullet list.

### 2. Domain type updates

**`packages/api-core/src/domain/types.ts`** - Add to `Domain` interface:

```typescript
contact_document_verification_request?: 'pending' | 'suspended';
```

**`packages/domains-table/src/utils/assembler.ts`** - Map to camelCase:

```typescript
contactDocumentVerificationRequest: domain.contact_document_verification_request ?? undefined,
```

**`client/state/sites/domains/assembler.js`** - Same camelCase mapping:

```javascript
contactDocumentVerificationRequest: domain.contact_document_verification_request ?? undefined,
```

**`client/lib/domains/types.ts`** - Add to legacy type:

```typescript
contactDocumentVerificationRequest?: 'pending' | 'suspended';
```

### 3. Dashboard (MSD) changes

**`client/dashboard/utils/domain-permissions.ts`** - Update permission check:

```typescript
const checkContactDocumentVerificationRequired: DomainCheckFunction = (domain) =>
  domain.contact_document_verification_request === 'pending' ||
  domain.contact_document_verification_request === 'suspended' ||
  // Backwards compat for .uk until backend migrates
  domain.nominet_pending_contact_verification_request ||
  domain.nominet_domain_suspended;
```

Replace `checkNominetPendingOrSuspended` with `checkContactDocumentVerificationRequired` in the `CONTACT_VERIFICATION` permission checks.

**`client/dashboard/domains/domain-contact-verification/index.tsx`** - Use TLD config:

- Extract TLD from `domainName`.
- Look up config from TLD map, fall back to generic.
- Replace hardcoded Nominet text in the description with `config.registryDescription`.
- Conditionally render accepted documents list only if `config.acceptedDocuments.length > 0`.
- If empty, show generic message: "Please upload a valid identification document."

### 4. Calypso (My Sites) changes

**`client/my-sites/domains/domain-management/settings/index.tsx`** - Update display condition in `renderContactVerificationSection()` to also check `contactDocumentVerificationRequest`:

```typescript
const showContactVerification =
  domain.contactDocumentVerificationRequest === 'pending' ||
  domain.contactDocumentVerificationRequest === 'suspended' ||
  domain.nominetPendingContactVerificationRequest ||
  domain.nominetDomainSuspended;
```

**`client/my-sites/domains/domain-management/settings/cards/contact-verification-card.tsx`** - Use TLD config:

- Same pattern as Dashboard: extract TLD, look up config, render dynamic copy.
- Replace hardcoded Nominet text and UK document list with config-driven content.

---

## Backend changes

### 5. New generic flag group

**New file:** `wp-content/lib/domains/domain-flags/domain-contact-document-verification-flag-group.php`

```php
class Domain_Contact_Document_Verification_Group extends Domain_Flag_Group_Base {
    public const PENDING = 'contact_document_verification_pending';
    public const SUSPENDED = 'contact_document_verification_suspended';

    // Same pattern as Domain_Nominet_Contact_Verification_Group:
    // - get_default_flag_value() returns current datetime
    // - get_valid_flag_types() returns [PENDING, SUSPENDED]
    // - should_set_flag() returns true
    // - should_update_existing_flag() returns true
}
```

**New file:** `wp-content/lib/domains/domain-flags/domain-contact-document-verification-flags-manager.php`

Same pattern as `Domain_Nominet_Contact_Verification_Flags_Manager`: only one flag at a time (delete-before-set).

**Update:** `wp-content/lib/domains/domain-flags/domain-flags.php` - Register the new manager in `FLAG_MANAGER_CLASSES`.

### 6. Expose new flag in API response

**Update:** `wp-content/admin-plugins/domains/domain-management-domain.php` (~line 512)

Add alongside existing Nominet flags:

```php
$contact_document_verification_manager = DI::get(Domain_Contact_Document_Verification_Flags_Manager::class);
$pending = $contact_document_verification_manager->get_flag_value(
    $wpcom_domain->name,
    Domain_Contact_Document_Verification_Group::PENDING
);
$suspended = $contact_document_verification_manager->get_flag_value(
    $wpcom_domain->name,
    Domain_Contact_Document_Verification_Group::SUSPENDED
);

if (!empty($pending)) {
    $this->contact_document_verification_request = 'pending';
} elseif (!empty($suspended)) {
    $this->contact_document_verification_request = 'suspended';
} else {
    $this->contact_document_verification_request = null;
}
```

Add the property to the class:

```php
public $contact_document_verification_request = null;
```

### 7. Zendesk ticket - make TLD-aware

**Update:** `public.api/rest/wpcom-json-endpoints/class.wpcom-store-domains-api-endpoints.php`

In `create_zendesk_ticket()`, replace the hardcoded Nominet-specific ticket message with TLD-aware content:

- For `.uk`: keep current Nominet copy and document list.
- For `.in`: generic message ("The registry requires contact verification for this domain.") without a specific document list.
- The subject, tags, Zendesk group, and custom fields remain the same for all TLDs.

### 8. Set pending flag on contact info update for .in domains

**Update:** `public.api/rest/wpcom-json-endpoints/class.wpcom-store-domains-api-endpoints.php`

In `WPCOM_JSON_API_Domains_Update_Whois_Endpoint::callback()` (and the v1.1 variant), after a successful `Domains_API::update_whois()` call for a .in domain:

1. Set the `contact_document_verification_request` flag to `pending`.
2. Send the manual verification email with a link to the contact verification page.

```php
$result = Domains_API::update_whois( $domain, $contact_information, $transfer_lock );

if ( ! is_wp_error( $result ) ) {
    $wpcom_domain = new WPCOM_Domain( $domain );
    if ( $wpcom_domain->get_tld() === 'in' ) {
        $contact_document_verification_manager = DI::get( Domain_Contact_Document_Verification_Flags_Manager::class );
        $contact_document_verification_manager->set_flag(
            $domain,
            Domain_Contact_Document_Verification_Group::PENDING
        );

        Domain_Emails::process_event(
            $domain,
            Domain_Email_Event::DOMAIN_MANUAL_VERIFICATION,
            [ 'recipient' => $whois_email ]
        );
    }
}
```

This ensures that every time a .in domain's contact info changes, the user must re-verify with document upload.

### 9. Set pending flag and send email on .in domain registration

**Update:** `async-jobs/includes/domains-post-register.php`

This async job runs ~10 minutes after domain registration. It already has `$tld_spec` and `$domain` in scope, and fires `DOMAIN_ACTIVATED` emails at line 67.

After the existing `DOMAIN_ACTIVATED` email logic (line 67), add a check for .in domains:

```php
// Existing code (line 65-68):
if ( $tld_spec->icann_emails_are_handled_by_automattic() ) {
    Domain_Emails::process_event( $domain, Domain_Email_Event::DOMAIN_ACTIVATED );
}

// NEW: Set contact document verification flag for .in domains
if ( 0 === substr_compare( $domain, '.in', -3 ) ) {
    $contact_document_verification_manager = WPCOM\Container\DI::get(
        Domain_Contact_Document_Verification_Flags_Manager::class
    );
    $contact_document_verification_manager->set_flag(
        $domain,
        Domain_Contact_Document_Verification_Group::PENDING
    );

    // Fetch registrant email from WHOIS since $contact_information is not in scope
    $whois = Domains_API::whois( $domain );
    if ( ! is_wp_error( $whois ) && ! empty( $whois['email'] ) ) {
        Domain_Emails::process_event(
            $domain,
            Domain_Email_Event::DOMAIN_MANUAL_VERIFICATION,
            [ 'recipient' => $whois['email'] ]
        );
    }
}
```

**Note:** The registrant email is fetched via `Domains_API::whois()` since `$contact_information` is not available in the async job context. The ~10 minute delay from `deferred_async_job` means WHOIS data should be available by the time this runs.

**Email template update:** The existing `Domain_Email_Domain_Manual_Verification` class (`get_email_specific_props()`) sets `validation_url` to `/domains/manage/{domain}/edit`. Update to `/domains/manage/{domain}/contact-verification` so the email links to the correct page.

---

## File summary

### Frontend (~8 files)

| File | Action |
|---|---|
| `packages/api-core/src/domain-contact-verification/tld-config.ts` | **New** - TLD config map |
| `packages/api-core/src/domain/types.ts` | Add `contact_document_verification_request` |
| `packages/domains-table/src/utils/assembler.ts` | Map new field to camelCase |
| `client/state/sites/domains/assembler.js` | Map new field to camelCase |
| `client/lib/domains/types.ts` | Add camelCase property |
| `client/dashboard/utils/domain-permissions.ts` | Update permission check |
| `client/dashboard/domains/domain-contact-verification/index.tsx` | TLD-aware copy |
| `client/my-sites/domains/domain-management/settings/cards/contact-verification-card.tsx` | TLD-aware copy |
| `client/my-sites/domains/domain-management/settings/index.tsx` | Update display condition |

### Backend (~7 files)

| File | Action |
|---|---|
| `domain-flags/domain-contact-document-verification-flag-group.php` | **New** - flag group |
| `domain-flags/domain-contact-document-verification-flags-manager.php` | **New** - flag manager |
| `domain-flags/domain-flags.php` | Register new manager |
| `admin-plugins/domains/domain-management-domain.php` | Expose new flag in API |
| `class.wpcom-store-domains-api-endpoints.php` | TLD-aware Zendesk ticket + set pending flag on contact info update for .in |
| `async-jobs/includes/domains-post-register.php` | Set pending flag + send email for .in registrations |
| `lib/domains/email/types/class-domain-email-domain-manual-verification.php` | Update `validation_url` to `/contact-verification` |

### Not in scope

- No new routes or pages
- No new API endpoints
- No checkout flow changes
- No migration of .uk from Nominet flags to generic flags (future work)
