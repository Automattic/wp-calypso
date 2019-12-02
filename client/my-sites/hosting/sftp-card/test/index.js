/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow, mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { SftpCard } from '..';

const translate = x => x;
const requestSftpUsers = x => x;

describe( 'SftpCard', () => {
	describe( 'Sftp Questions', () => {
		it( 'should display sftp questions if no sftp username', () => {
			const wrapper = shallow( <SftpCard translate={ translate } /> );

			expect( wrapper.find( '.sftp-card__questions' ).length ).toEqual( 1 );
		} );
		it( 'should not display sftp questions if sftp username is set', () => {
			const wrapper = shallow( <SftpCard translate={ translate } username="testuser" /> );

			expect( wrapper.find( '.sftp-card__questions' ).length ).toEqual( 0 );
		} );
		it( 'should not display sftp questions if loading', () => {
			// need to use a mount rather than shallow for tests that require useEffects to run
			const wrapper = mount(
				<SftpCard translate={ translate } requestSftpUsers={ requestSftpUsers } />
			);

			expect( wrapper.find( '.sftp-card__questions' ).length ).toEqual( 0 );
		} );
	} );

	describe( 'Loading', () => {
		it( 'should display spinner if username not set and not disabled', () => {
			const wrapper = mount(
				<SftpCard translate={ translate } requestSftpUsers={ requestSftpUsers } />
			);

			expect( wrapper.find( 'Spinner' ).length ).toEqual( 1 );
		} );
		it( 'should note display spinner if disabled', () => {
			const wrapper = mount(
				<SftpCard translate={ translate } requestSftpUsers={ requestSftpUsers } disabled={ true } />
			);

			expect( wrapper.find( 'Spinner' ).length ).toEqual( 0 );
		} );
	} );

	describe( 'Create SFTP Credentials', () => {
		it( 'should display create SFTP credentials if username not set', () => {
			const wrapper = shallow( <SftpCard translate={ translate } /> );

			expect( wrapper.find( '.sftp-card__create-credentials-button' ).length ).toEqual( 1 );
		} );
		it( 'should not display create SFTP credentials if username set', () => {
			const wrapper = shallow( <SftpCard translate={ translate } username="testuser" /> );

			expect( wrapper.find( '.sftp-card__create-credentials-button' ).length ).toEqual( 0 );
		} );
	} );

	describe( 'User info fields', () => {
		it( 'should display user info fields if username set', () => {
			const wrapper = shallow( <SftpCard translate={ translate } username="testuser" /> );

			expect( wrapper.find( '.sftp-card__info-field' ).length ).toEqual( 1 );
		} );
		it( 'should not display user info fields if username not set', () => {
			const wrapper = shallow( <SftpCard translate={ translate } /> );

			expect( wrapper.find( '.sftp-card__info-field' ).length ).toEqual( 0 );
		} );
	} );

	describe( 'Password', () => {
		it( 'should display password field if password set', () => {
			const wrapper = shallow(
				<SftpCard translate={ translate } username="testuser" password="secret" />
			);

			expect( wrapper.find( '.sftp-card__password-field' ).length ).toEqual( 1 );
		} );
		it( 'should not display password field if password not set', () => {
			const wrapper = shallow( <SftpCard translate={ translate } username="testuser" /> );

			expect( wrapper.find( '.sftp-card__password-field' ).length ).toEqual( 0 );
		} );
		it( 'should display password reset button if password not set', () => {
			const wrapper = shallow( <SftpCard translate={ translate } username="testuser" /> );

			expect( wrapper.find( '.sftp-card__password-reset-button' ).length ).toEqual( 1 );
		} );
	} );
} );
