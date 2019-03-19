/**
 * External dependencies
 */
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import ClipboardButton from 'components/forms/clipboard-button';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import Dialog from 'components/dialog';
import { getLoginUrlWithTOSRedirect } from 'lib/google-apps';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import wp from 'lib/wp';

function PendingGappsTosNoticeDialog( props ) {
	const [ password, setPassword ] = useState( false );
	const [ isCopied, setIsCopied ] = useState( false );
	const translate = useTranslate();

	const onPasswordClickHandler = e => {
		e.preventDefault;
		const wpcom = wp.undocumented();
		const mailbox = props.user.split( '@' )[ 0 ];
		wpcom.resetPasswordForMailbox( props.domainName, mailbox ).then( data => {
			setPassword( data.password );
		} );
	};

	const recordLogInClick = () => {
		props.pendingAccountLogInClick( {
			domainName: props.domainName,
			isMultipleDomains: props.isMultipleDomains,
			user: props.user,
			severity: props.severity,
			section: props.section,
			siteSlug: props.siteSlug,
		} );
	};

	const onCopyAction = () => {
		setIsCopied( true );
	};

	return (
		<Dialog className="domain-warnings__dialog" isVisible={ props.visible }>
			<header>
				<h1>{ translate( 'Finish G Suite Setup' ) }</h1>
				<button onClick={ props.onClose }>
					<Gridicon icon="cross" />
				</button>
			</header>

			<p>
				{ password &&
					translate(
						'We have reset your temporary password. Please log in as `%s` with this password to finish setup:',
						{
							args: props.user,
						}
					) }
				{ ! password &&
					translate(
						'In order to finish setup, you must now log into G Suite using the username and password that we sent to your email address (%s).',
						{
							args: props.user,
						}
					) }
			</p>
			{ password && (
				<Fragment>
					<p>
						Password: <strong>{ password }</strong>
						<ClipboardButton
							className="domain-warnings__dialog-copy"
							onCopy={ onCopyAction }
							text={ password }
						>
							{ isCopied && <Gridicon icon="checkmark" /> }
							{ isCopied ? 'Copied!' : 'Copy Password' }
						</ClipboardButton>
					</p>
					<Button
						href={ getLoginUrlWithTOSRedirect( props.user, props.domainName ) }
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
					<VerticalNavItem onClick={ onPasswordClickHandler } key="0" path={ '#' }>
						I don't have the password
					</VerticalNavItem>
					<VerticalNavItem
						onClick={ recordLogInClick }
						path={ getLoginUrlWithTOSRedirect( props.user, props.domainName ) }
						external
						key="1"
					>
						I have the password, take me to the login page
					</VerticalNavItem>
				</VerticalNav>
			) }
		</Dialog>
	);
}

PendingGappsTosNoticeDialog.propTypes = {
	domainName: PropTypes.string.isRequired,
	isMultipleDomains: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	section: PropTypes.string.isRequired,
	severity: PropTypes.string.isRequired,
	siteSlug: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired,
};

const pendingAccountLogInClick = ( {
	siteSlug,
	domainName,
	user,
	severity,
	isMultipleDomains,
	section,
} ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Clicked "Log in" link in G Suite pending ToS notice in ${ section }`,
			'Domain Name',
			domainName
		),
		recordTracksEvent( 'calypso_domain_management_gsuite_pending_account_log_in_click', {
			site_slug: siteSlug,
			domain_name: domainName,
			user,
			severity,
			is_multiple_domains: isMultipleDomains,
			section,
		} )
	);

export default connect(
	null,
	{
		pendingAccountLogInClick,
	}
)( PendingGappsTosNoticeDialog );
