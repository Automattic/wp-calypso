# Implementation Plan: Contact Details & Privacy

## Overview

This implementation plan creates a new "Contact details & privacy" feature for the WordPress.com Dashboard, allowing users to view and edit domain contact information. The implementation follows dashboard patterns using TypeScript, TanStack Query, and WordPress components.

## Tasks

- [x] 1. Set up component structure and routing

  - Create the `client/dashboard/domains/domain-contact-details/` directory
  - Set up the main component files and basic structure
  - Add routing configuration for the contact details page
  - _Requirements: 1.1, 1.2, 5.7_

- [-] 2. Create the summary component for settings menu

  - [x] 2.1 Implement ContactDetailsSummary component

    - Create summary button component following existing patterns
    - Display privacy protection status indicator
    - Integrate with domain overview settings menu
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [x] 2.2 Write unit tests for ContactDetailsSummary
    - Test privacy status display logic
    - Test navigation functionality
    - _Requirements: 1.1, 1.3_

- [x] 3. Implement data loading and TanStack Query integration

  - [x] 3.1 Set up domain whois data fetching

    - Integrate domainWhoisQuery from @automattic/api-queries
    - Handle loading states and error conditions
    - Implement proper TypeScript types
    - _Requirements: 8.1, 8.5, 2.4, 2.5_

  - [ ]\* 3.2 Write property test for data loading
    - **Property 1: Contact Information Display**
    - **Validates: Requirements 2.1, 2.2**

- [x] 4. Create the main contact details page

  - [x] 4.1 Implement DomainContactDetails main component

    - Create page layout with header and navigation
    - Integrate with existing domain routing patterns
    - Handle breadcrumb navigation
    - _Requirements: 2.1, 5.1, 5.7_

  - [x] 4.2 Add loading and error states

    - Implement skeleton loading for contact information
    - Add error handling with retry functionality
    - _Requirements: 2.4, 2.5_

  - [ ]\* 4.3 Write unit tests for main page component
    - Test page rendering and navigation
    - Test loading and error state handling
    - _Requirements: 2.4, 2.5_

- [x] 5. Implement the contact information form

  - [x] 5.1 Create ContactForm component

    - Implement all contact form fields using WordPress components
    - Add form validation for required fields
    - Handle country and state/province dropdowns
    - _Requirements: 3.1, 4.4, 4.6, 4.7, 5.1, 5.3_

  - [x] 5.2 Add form validation logic

    - Implement client-side validation for required fields
    - Add email format validation
    - Add phone number validation with country code support
    - _Requirements: 4.1, 4.2, 4.4, 4.5_

  - [ ]\* 5.3 Write property test for required field validation

    - **Property 2: Required Field Validation**
    - **Validates: Requirements 4.4**

  - [ ]\* 5.4 Write property test for email validation
    - **Property 3: Email Format Validation**
    - **Validates: Requirements 4.1**

- [x] 6. Implement data saving functionality

  - [x] 6.1 Set up contact information saving

    - Integrate domainWhoisMutation from @automattic/api-queries
    - Handle form submission and success/error states
    - Implement proper data transformation between form and API
    - _Requirements: 3.3, 3.5, 8.2, 8.6_

  - [x] 6.2 Add validation before saving

    - Integrate domainWhoisValidateMutation for server-side validation
    - Display field-specific validation errors
    - _Requirements: 3.2, 4.5, 8.3_

  - [ ]\* 6.3 Write property test for data round trip
    - **Property 4: Contact Information Round Trip**
    - **Validates: Requirements 3.3, 8.2**

- [ ] 7. Implement transfer lock management

  - [ ] 7.1 Create TransferLockSection component

    - Add 60-day transfer lock opt-out checkbox
    - Implement "What is this?" informational link
    - Handle transfer lock state management
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]\* 7.2 Write property test for transfer lock functionality
    - **Property 5: Transfer Lock State Management**
    - **Validates: Requirements 6.4**

- [ ] 8. Add legal agreement integration

  - [ ] 8.1 Implement legal agreement notices

    - Add Domain Registration Agreement information
    - Include Designated Agent links and notices
    - Display agreement acknowledgment requirements
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]\* 8.2 Write unit tests for legal agreement display
    - Test agreement notice rendering
    - Test link functionality
    - _Requirements: 7.2, 7.3_

- [ ] 9. Integrate with domain settings menu

  - [ ] 9.1 Add ContactDetailsSummary to DomainOverviewSettings

    - Modify domain-overview/settings.tsx to include new menu item
    - Position between "Domain forwarding" and "Domain security"
    - Handle conditional display based on domain type
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ]\* 9.2 Write integration tests for settings menu
    - Test menu item display and positioning
    - Test navigation to contact details page
    - _Requirements: 1.1, 1.2_

- [ ] 10. Add styling and responsive design

  - [ ] 10.1 Implement component styles

    - Create SCSS files following dashboard patterns
    - Ensure responsive design across screen sizes
    - Use CSS logical properties for RTL support
    - _Requirements: 5.4, 5.6_

  - [ ] 10.2 Ensure accessibility compliance
    - Implement proper keyboard navigation
    - Add screen reader support
    - Follow WordPress accessibility guidelines
    - _Requirements: 5.5_

- [ ] 11. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ]\* 12. Write comprehensive property tests

  - [ ]\* 12.1 Write property test for form state consistency
    - **Property 6: Form State Consistency**
    - **Validates: Requirements 4.5**

- [ ] 13. Final integration and testing

  - [ ] 13.1 Test complete user flow

    - Verify end-to-end contact information update process
    - Test integration with existing domain management features
    - Validate all error handling scenarios
    - _Requirements: 3.5, 2.5_

  - [ ]\* 13.2 Write integration tests
    - Test complete contact information update flow
    - Test error handling and recovery scenarios
    - _Requirements: 3.3, 3.4, 3.5_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests ensure end-to-end functionality works correctly
- The implementation follows WordPress component patterns and dashboard architecture
