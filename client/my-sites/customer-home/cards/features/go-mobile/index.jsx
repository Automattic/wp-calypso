/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import userAgent from 'calypso/lib/user-agent';
import CardHeading from 'calypso/components/card-heading';
import { sendEmailLogin } from 'calypso/state/auth/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export const GoMobile = ( { email, sendMobileLoginEmail } ) => {
	const translate = useTranslate();
	const { isiPad, isiPod, isiPhone, isAndroid } = userAgent;
	const isIos = isiPad || isiPod || isiPhone;
	const showIosBadge = ! isAndroid;
	const showAndroidBadge = ! isIos;
	const showOnlyOneBadge = showIosBadge !== showAndroidBadge;
	const isDesktopApp = config.isEnabled( 'desktop' );

	const emailLogin = () => {
		sendMobileLoginEmail( email );
	};

	return (
		<Card className="go-mobile">
			<div className={ classnames( 'go-mobile__row', { 'has-2-cols': showOnlyOneBadge } ) }>
				<div className="go-mobile__title">
					<CardHeading>{ translate( 'WordPress app' ) }</CardHeading>
				</div>
				<div className="go-mobile__app-badges">
					{ showIosBadge && (
						<AppsBadge storeName={ 'ios' } utm_source={ 'calypso-customer-home' }></AppsBadge>
					) }
					{ showAndroidBadge && (
						<AppsBadge storeName={ 'android' } utm_source={ 'calypso-customer-home' }></AppsBadge>
					) }
				</div>
			</div>
			{ ! isDesktopApp && (
				<div className="go-mobile__email-link">
					{ translate( 'Get a download link via email — click it on your phone to get the app.' ) }
					<Button className="go-mobile__email-link-button is-link" onClick={ emailLogin }>
						{ translate( 'Send my download link' ) }
					</Button>
				</div>
			) }
		</Card>
	);
};

const sendMobileLoginEmail = ( email ) =>
	withAnalytics(
		recordTracksEvent( 'calypso_customer_home_request_mobile_email_login' ),
		sendEmailLogin( email, { showGlobalNotices: true, isMobileAppLogin: true } )
	);

export default connect(
	( state ) => {
		return {
			email: getCurrentUserEmail( state ),
		};
	},
	{
		sendMobileLoginEmail,
	}
)( GoMobile );
