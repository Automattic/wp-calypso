/**
 * External dependencies
 */
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { Button, Dialog } from '@automattic/components';
import { CALYPSO_CONTACT } from 'lib/url/support';
import ClipboardButton from 'components/forms/clipboard-button';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { errorNotice } from 'state/notices/actions';
import { getLoginUrlWithTOSRedirect } from 'lib/gsuite';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import wp from 'lib/wp';

function PendingGSuiteTosNoticeDialog( props ) {
	const [ password, setPassword ] = useState( false );
	const [ isCopied, setIsCopied ] = useState( false );
	const [ openTracked, setOpenTracked ] = useState( false );
	const translate = useTranslate();

	const trackEvent = ( message, tracksEvent ) => {
		props.trackEvent( {
			domainName: props.domainName,
			message,
			section: props.section,
			siteSlug: props.siteSlug,
			tracksEvent,
			user: props.user,
		} );
	};

	if ( props.visible && ! openTracked ) {
		trackEvent(
			`Opened G Suite "ToS Dialog" via ${ props.section }`,
			'calypso_domain_management_gsuite_pending_account_open_dialog'
		);

		setOpenTracked( true );
	}

	const onCloseClick = () => {
		trackEvent(
			`Clicked "Close ToS Dialog" link in G Suite pending ToS dialog via ${ props.section }`,
			'calypso_domain_management_gsuite_pending_account_close_dialog_click'
		);

		setOpenTracked( false );
		props.onClose();
	};

	const onCopyAction = () => {
		setIsCopied( true );

		trackEvent(
			`Clicked "Copy Password" link in G Suite pending ToS dialog via ${ props.section }`,
			'calypso_domain_management_gsuite_pending_account_copy_password_click'
		);
	};

	const onPasswordClick = ( event ) => {
		event.preventDefault();

		const wpcom = wp.undocumented();
		const mailbox = props.user.split( '@' )[ 0 ];

		wpcom.resetPasswordForMailbox( props.domainName, mailbox ).then(
			( data ) => {
				setPassword( data.password );
			},
			() => {
				props.errorNotice(
					translate(
						'There was a problem resetting the password for %(gsuiteEmail)s. Please {{link}}contact support{{/link}}.',
						{
							args: {
								gsuiteEmail: props.user,
							},
							components: {
								link: <a href={ CALYPSO_CONTACT } />,
							},
						}
					)
				);

				setOpenTracked( false );
				props.onClose();
			}
		);

		trackEvent(
			`Clicked "Get Password" link in G Suite pending ToS dialog via ${ props.section }`,
			'calypso_domain_management_gsuite_pending_account_get_password_click'
		);
	};

	const onLogInClick = () => {
		trackEvent(
			`Clicked "Get Password" link in G Suite pending ToS dialog via ${ props.section }`,
			'calypso_domain_management_gsuite_pending_account_login_click'
		);
	};

	const onResetPasswordLogInClick = () => {
		trackEvent(
			`Clicked "Login" link after reset in G Suite pending ToS dialog via ${ props.section }`,
			'calypso_domain_management_gsuite_pending_account_login_after_reset_click'
		);
	};

	const renderEntryCopy = () => {
		return translate( 'Do you already have the password for %(gsuiteEmail)s?', {
			args: {
				gsuiteEmail: props.user,
			},
		} );
	};

	const renderPasswordResetCopy = () => {
		return translate(
			'We have reset the password for %s. Copy the new password below and click to continue.',
			{
				args: props.user,
			}
		);
	};

	return (
		<Dialog className="domain-warnings__dialog" isVisible={ props.visible }>
			<header>
				<h1>{ translate( 'Log in to G Suite to finish setup' ) }</h1>
				<button onClick={ onCloseClick }>
					<Gridicon icon="cross" />
				</button>
			</header>

			<p>{ password ? renderPasswordResetCopy() : renderEntryCopy() }</p>

			{ password && (
				<Fragment>
					<p>
						<strong className="domain-warnings__password">{ password }</strong>
						<ClipboardButton
							className="domain-warnings__dialog-copy"
							onCopy={ onCopyAction }
							text={ password }
							compact={ true }
						>
							{ isCopied && <Gridicon icon="checkmark" /> }
							{ isCopied ? translate( 'Copied!' ) : translate( 'Copy' ) }
						</ClipboardButton>
					</p>

					<Button
						href={ getLoginUrlWithTOSRedirect( props.user, props.domainName ) }
						onClick={ onResetPasswordLogInClick }
						primary={ isCopied }
						rel="noopener noreferrer"
						target="_blank"
					>
						{ translate( 'Log In to G Suite and Finish Setup' ) }
					</Button>
				</Fragment>
			) }

			{ ! password && (
				<VerticalNav>
					<VerticalNavItem onClick={ onPasswordClick } key="0" path={ '#' }>
						{ translate( "I {{strong}}don't{{/strong}} have the password", {
							components: { strong: <strong /> },
						} ) }
					</VerticalNavItem>

					<VerticalNavItem
						onClick={ onLogInClick }
						path={ getLoginUrlWithTOSRedirect( props.user, props.domainName ) }
						external
						key="1"
					>
						{ translate( 'I have the password, take me to the login page' ) }
					</VerticalNavItem>
				</VerticalNav>
			) }
		</Dialog>
	);
}

PendingGSuiteTosNoticeDialog.propTypes = {
	domainName: PropTypes.string.isRequired,
	errorNotice: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	section: PropTypes.string.isRequired,
	siteSlug: PropTypes.string.isRequired,
	trackEvent: PropTypes.func.isRequired,
	user: PropTypes.string.isRequired,
};

const trackEvent = ( { domainName, message, section, siteSlug, tracksEvent, user } ) =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Management', message, 'Domain Name', domainName ),
		recordTracksEvent( tracksEvent, {
			domain_name: domainName,
			section,
			site_slug: siteSlug,
			user,
		} )
	);

export default connect( null, {
	errorNotice,
	trackEvent,
} )( PendingGSuiteTosNoticeDialog );
