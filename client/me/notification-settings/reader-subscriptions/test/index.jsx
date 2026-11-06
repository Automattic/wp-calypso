/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { NotificationSubscriptions } from '../';

jest.mock( 'calypso/components/data/with-reader-teams', () => ( {
	withReaderTeams: ( component ) => component,
} ) );
jest.mock( 'calypso/components/inline-support-link', () => () => null );
jest.mock( 'calypso/components/localized-moment', () => ( {
	withLocalizedMoment: ( component ) => component,
} ) );
jest.mock( 'calypso/components/navigation-header', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );
jest.mock( 'calypso/lib/protect-form', () => ( {
	protectForm: ( component ) => component,
} ) );
jest.mock( 'calypso/lib/two-step-authorization', () => ( {} ) );
jest.mock( 'calypso/me/form-base/with-form-base', () => ( component ) => component );
jest.mock( 'calypso/me/notification-settings/navigation', () => () => null );
jest.mock( 'calypso/me/reauth-required', () => () => null );
jest.mock( 'calypso/reader/following/hooks/use-non-self-subscriptions-count', () => ( {
	useNonSelfSubscriptionsCount: () => ( { nonSelfSubscriptionsCount: 0 } ),
} ) );
jest.mock( '../../subscription-management-back-button', () => () => null );

test( 'shows default email delivery only after its saved value is available', () => {
	const settings = {
		subscription_delivery_email_default: '',
		subscription_delivery_mail_option: 'html',
		subscription_delivery_hour: '0',
		subscription_delivery_day: '1',
		subscription_delivery_jabber_default: false,
		subscription_delivery_email_blocked: false,
	};
	const props = {
		getSetting: ( name ) => settings[ name ] ?? '',
		getDisabledState: () => false,
		updateSetting: jest.fn(),
		submitForm: jest.fn(),
		translate: ( text ) => text,
		locale: 'en',
		teams: [],
		deliveryWindowOffsetHours: 0,
		deliveryWindowIsUtcFallback: true,
		deliveryWindowTimezone: 'UTC',
	};
	const { rerender } = render( <NotificationSubscriptions { ...props } /> );

	expect( screen.queryByRole( 'combobox', { name: 'Default email delivery' } ) ).toBeNull();

	for ( const [ value, label ] of [
		[ 'instantly', 'Send email instantly' ],
		[ 'never', 'Never send email' ],
		[ 'daily', 'Send email daily' ],
		[ 'weekly', 'Send email every week' ],
	] ) {
		settings.subscription_delivery_email_default = value;
		rerender( <NotificationSubscriptions { ...props } /> );

		const select = screen.getByRole( 'combobox', { name: 'Default email delivery' } );
		expect( select ).toBeVisible();
		expect( select ).toHaveValue( value );
		expect( screen.getByRole( 'option', { name: label } ).selected ).toBe( true );
	}

	expect( props.updateSetting ).not.toHaveBeenCalled();
	expect( props.submitForm ).not.toHaveBeenCalled();
} );
