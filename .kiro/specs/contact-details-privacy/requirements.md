# Requirements Document

## Introduction

This feature adds a new "Contact details & privacy" menu item to the domain settings section in the WordPress.com Dashboard. The feature allows users to view and edit domain contact information for their registered domains, providing a centralized interface for managing domain registrant, administrative, and technical contact details.

## Glossary

- **Domain_Contact_Manager**: The system component responsible for managing domain contact information
- **Contact_Information**: The set of contact details including name, organization, address, phone, and email
- **Registrant_Contact**: The legal owner of the domain registration
- **Administrative_Contact**: The contact responsible for administrative decisions about the domain
- **Technical_Contact**: The contact responsible for technical issues related to the domain
- **WHOIS_Database**: The public database containing domain registration information
- **Dashboard**: The WordPress.com hosting dashboard interface
- **Domain_Settings**: The settings section for individual domains in the dashboard

## Requirements

### Requirement 1: Contact Details Menu Integration

**User Story:** As a domain owner, I want to access contact details management from the domain settings menu, so that I can easily find and manage my domain contact information.

#### Acceptance Criteria

1. WHEN a user views a domain's settings page at `/domains/{domain}`, THE Dashboard SHALL display a "Contact details & privacy" menu item in the settings list
2. WHEN a user clicks the "Contact details & privacy" menu item, THE Dashboard SHALL navigate to the contact details management page for that specific domain
3. THE Dashboard SHALL display the menu item with appropriate status indicators showing current privacy protection status
4. THE Dashboard SHALL position the menu item logically within the existing settings menu structure between "Domain forwarding" and "Domain security" as shown in the design
5. THE Dashboard SHALL integrate the menu item into the existing `DomainOverviewSettings` component following the established pattern of other settings menu items

### Requirement 2: Contact Information Display

**User Story:** As a domain owner, I want to view my current domain contact information, so that I can verify the accuracy of my registration details.

#### Acceptance Criteria

1. WHEN a user accesses the contact details page, THE Domain_Contact_Manager SHALL display all current contact information for the domain
2. THE Domain_Contact_Manager SHALL display the following contact fields: first name, last name, organization, email, country code, phone number, country, address, address line 2, city, state/province, and postal code
3. THE Domain_Contact_Manager SHALL organize contact information into clear sections for registrant, administrative, and technical contacts
4. WHEN contact information is loading, THE Dashboard SHALL display appropriate loading states
5. IF contact information cannot be retrieved, THEN THE Dashboard SHALL display a clear error message with retry options
6. THE Domain_Contact_Manager SHALL display contact information in a readable, well-formatted layout

### Requirement 3: Contact Information Editing

**User Story:** As a domain owner, I want to edit my domain contact information, so that I can keep my registration details current and accurate.

#### Acceptance Criteria

1. WHEN a user has permission to edit contact information, THE Dashboard SHALL provide edit functionality for all contact fields including first name, last name, organization, email, country code, phone number, country, address, address line 2, city, state/province, and postal code
2. WHEN a user modifies contact information, THE Domain_Contact_Manager SHALL validate all required fields (first name, last name, email, country, address, city, postal code) before allowing submission
3. WHEN a user submits valid contact information changes, THE Domain_Contact_Manager SHALL save the changes and update the WHOIS_Database
4. IF contact information validation fails, THEN THE Dashboard SHALL display specific error messages for each invalid field
5. WHEN contact information is successfully updated, THE Dashboard SHALL display a confirmation message and refresh the displayed information
6. THE Dashboard SHALL provide appropriate form controls including text inputs, dropdowns for country and state selection, and phone number formatting

### Requirement 4: Form Validation and Data Integrity

**User Story:** As a domain owner, I want the system to validate my contact information, so that my domain registration remains compliant and functional.

#### Acceptance Criteria

1. WHEN a user enters contact information, THE Domain_Contact_Manager SHALL validate email addresses using proper email format validation
2. WHEN a user enters phone numbers, THE Domain_Contact_Manager SHALL validate phone number format according to the selected country code
3. WHEN a user enters postal addresses, THE Domain_Contact_Manager SHALL validate required address components for the selected country
4. THE Domain_Contact_Manager SHALL require first name, last name, email, country, address, city, and postal code as mandatory fields
5. IF any validation fails, THEN THE Dashboard SHALL prevent form submission and highlight invalid fields with descriptive error messages
6. THE Dashboard SHALL provide country-specific state/province dropdowns when applicable
7. THE Dashboard SHALL format phone numbers according to the selected country code format

### Requirement 5: User Interface Integration

**User Story:** As a dashboard user, I want the contact details interface to be consistent with the existing dashboard design, so that I have a seamless user experience.

#### Acceptance Criteria

1. THE Dashboard SHALL implement the contact details interface using WordPress core components from `@wordpress/components` and existing dashboard components
2. THE Dashboard SHALL follow established dashboard patterns for form layouts, buttons, and navigation, particularly following the patterns used in other domain settings components
3. THE Dashboard SHALL use WordPress DataForms patterns for form handling and validation where applicable
4. THE Dashboard SHALL maintain responsive design compatibility across desktop and mobile devices
5. THE Dashboard SHALL implement proper accessibility features including keyboard navigation and screen reader support following WordPress accessibility standards
6. THE Dashboard SHALL use consistent typography, spacing, and visual hierarchy with other dashboard sections
7. THE Dashboard SHALL follow the component structure patterns established in the `client/dashboard/domains/` directory, creating appropriate summary components and detail pages

### Requirement 6: Transfer Lock Management

**User Story:** As a domain owner, I want to manage my domain's transfer lock settings, so that I can control when my domain can be transferred to another registrar.

#### Acceptance Criteria

1. THE Dashboard SHALL display the current status of the 60-day transfer lock for the domain
2. WHEN a user views the contact details form, THE Dashboard SHALL show an opt-out checkbox for the 60-day transfer lock
3. WHEN a user clicks "What is this?" link, THE Dashboard SHALL provide clear information about the transfer lock feature
4. WHEN a user modifies the transfer lock setting, THE Domain_Contact_Manager SHALL update the domain's transfer lock status
5. THE Dashboard SHALL clearly indicate the implications of opting out of the transfer lock protection

### Requirement 7: Legal Agreement Integration

**User Story:** As a domain owner, I want to understand the legal implications of updating my contact information, so that I can make informed decisions about my domain registration.

#### Acceptance Criteria

1. THE Dashboard SHALL display information about the Domain Registration Agreement when users modify contact information
2. WHEN a user clicks "Save", THE Dashboard SHALL require acknowledgment of the applicable Domain Registration Agreement
3. THE Dashboard SHALL provide links to the Domain Registration Agreement and Designated Agent information
4. THE Dashboard SHALL clearly explain that contact information changes may be subject to the same agreement terms

### Requirement 8: API Integration and Data Loading

**User Story:** As a developer, I want to integrate with the existing WordPress.com domain management APIs using TanStack Query, so that the contact details feature follows the dashboard's modern data fetching patterns.

#### Acceptance Criteria

1. THE Domain_Contact_Manager SHALL use the existing `domainWhoisQuery` from `@automattic/api-queries` to retrieve current contact information
2. THE Domain_Contact_Manager SHALL use the existing `domainWhoisMutation` from `@automattic/api-queries` to save updated contact information
3. THE Domain_Contact_Manager SHALL use the existing `domainWhoisValidateMutation` from `@automattic/api-queries` for contact information validation
4. THE Domain_Contact_Manager SHALL follow the existing `DomainContactDetails` type structure with fields: firstName, lastName, organization, email, phone, address1, address2, city, state, postalCode, countryCode, fax, optOutTransferLock
5. THE Domain_Contact_Manager SHALL integrate with TanStack Query for data fetching, caching, and state management following dashboard patterns
6. THE Domain_Contact_Manager SHALL handle the transferLock parameter when saving contact information updates using the existing mutation interface
