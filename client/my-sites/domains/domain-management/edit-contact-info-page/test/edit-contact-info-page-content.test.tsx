/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { buildDomainResponse } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/launchpad/test/lib/fixtures';
import { whoisType } from 'calypso/lib/domains/whois/constants';
import EditContactInfoPageContent from '../edit-contact-info-page-content';

describe( 'EditContactInfoPageContent', () => {
	const renderComponent = ( props = {} ) => {
		const defaultProps = {
			currentRoute: '',
			domains: [],
			selectedDomainName: '',
			selectedSite: {
				slug: 'example.com',
			},
			isCard: false,
		};

		const initialState = {
			currentUser: { user: { email: 'test@example.com' } },
			countries: { domains: [] },
			domains: {
				management: {
					items: {
						mydomain: [
							{
								fname: 'test',
								type: whoisType.REGISTRANT,
							},
						],
					},
				},
			},
		};

		const store = createStore( ( state ) => state, initialState );

		return render(
			<Provider store={ store }>
				<EditContactInfoPageContent { ...defaultProps } { ...props } />
			</Provider>
		);
	};

	it( "should render notice when user can't manage the domain", () => {
		const { container } = renderComponent( {
			domains: [ buildDomainResponse( { currentUserCanManage: false } ) ],
		} );

		expect( container.textContent ).toContain( 'These settings can be changed by the user' );
	} );

	it( "should render notice when the user can't update the contact info", () => {
		const { container } = renderComponent( {
			domains: [
				buildDomainResponse( {
					currentUserCanManage: true,
					canUpdateContactInfo: false,
					cannotUpdateContactInfoReason: 'reason',
				} ),
			],
		} );

		expect( container.textContent ).toContain( 'reason' );
	} );

	it( 'should render notice when the domain is pending a whois update', () => {
		const { container } = renderComponent( {
			domains: [
				buildDomainResponse( {
					currentUserCanManage: true,
					canUpdateContactInfo: true,
					isPendingWhoisUpdate: true,
				} ),
			],
		} );

		expect( container.textContent ).toContain( 'Domain is pending contact information update.' );
	} );

	it( 'should render remove privacy notice when the domain is private', () => {
		const { container } = renderComponent( {
			domains: [
				buildDomainResponse( {
					currentUserCanManage: true,
					canUpdateContactInfo: true,
					mustRemovePrivacyBeforeContactUpdate: true,
					privateDomain: true,
				} ),
			],
		} );

		expect( container.textContent ).toContain(
			'This domain is currently using Privacy Protection'
		);
	} );

	it( 'should render the edit form when the user can edit', () => {
		const { container } = renderComponent( {
			domains: [
				buildDomainResponse( {
					currentUserCanManage: true,
					canUpdateContactInfo: true,
					mustRemovePrivacyBeforeContactUpdate: false,
					domainRegistrationAgreementUrl: 'url',
					name: 'mydomain',
				} ),
			],
			selectedDomainName: 'mydomain',
		} );

		expect( container.firstChild.tagName ).toBe( 'FORM' );
	} );
} );
