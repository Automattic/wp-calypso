import { Button, Card, Gridicon } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import {
	getCacheKey as getMailboxesQueryKey,
	useGetMailboxes,
} from 'calypso/data/emails/use-get-mailboxes';
import errorIllustration from 'calypso/landing/browsehappy/illustration.svg';
import {
	getEmailAddress,
	isEmailForwardAccount,
	isGoogleEmailAccount,
	isTitanMailAccount,
} from 'calypso/lib/emails';
import { getGmailUrl } from 'calypso/lib/gsuite';
import { GOOGLE_PROVIDER_NAME } from 'calypso/lib/gsuite/constants';
import { getTitanEmailUrl, useTitanAppsUrlPrefix } from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import NewMailboxUpsell from 'calypso/my-sites/email/inbox/new-mailbox-upsell';
import { emailManagementInbox } from 'calypso/my-sites/email/paths';
import { recordPageView, enhanceWithSiteMainProduct } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { withEnhancers } from 'calypso/state/utils';
import ProgressLine from './progress-line';

/**
 * Import styles
 */
import './style.scss';

const getExternalUrl = ( mailbox, titanAppsUrlPrefix ) => {
	if ( isTitanMailAccount( mailbox ) ) {
		return getTitanEmailUrl(
			titanAppsUrlPrefix,
			getEmailAddress( mailbox ),
			! titanAppsUrlPrefix,
			window.location.href
		);
	}

	if ( isGoogleEmailAccount( mailbox ) ) {
		return getGmailUrl( getEmailAddress( mailbox ) );
	}

	return '';
};

const MailboxItemIcon = ( { mailbox } ) => {
	const translate = useTranslate();

	if ( isTitanMailAccount( mailbox ) ) {
		return (
			<span className="mailbox-selection-list__icon-circle">{ mailbox.mailbox[ 0 ] ?? 'T' }</span>
		);
	}

	if ( isGoogleEmailAccount( mailbox ) ) {
		return <img src={ googleWorkspaceIcon } alt={ translate( 'Google Workspace icon' ) } />;
	}

	return null;
};

const getProvider = ( mailbox ) => {
	if ( isTitanMailAccount( mailbox ) ) {
		return TITAN_PROVIDER_NAME;
	}

	if ( isGoogleEmailAccount( mailbox ) ) {
		return GOOGLE_PROVIDER_NAME;
	}

	if ( isEmailForwardAccount( mailbox ) ) {
		return 'forward';
	}

	return null;
};

const trackAppLaunchEvent = ( { mailbox, app, context } ) => {
	const provider = getProvider( mailbox );
	recordEmailAppLaunchEvent( {
		app,
		context,
		provider,
	} );
};

MailboxItemIcon.propType = {
	mailbox: PropTypes.object.isRequired,
};

const MailboxItem = ( { mailbox } ) => {
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();

	if ( isEmailForwardAccount( mailbox ) ) {
		return null;
	}

	return (
		<Card
			onClick={ () =>
				trackAppLaunchEvent( { mailbox, app: 'webmail', context: 'inbox-mailbox-selection' } )
			}
			className="mailbox-selection-list__item"
			href={ getExternalUrl( mailbox, titanAppsUrlPrefix ) }
			target={ isTitanMailAccount( mailbox ) ? null : 'external' }
		>
			<span className="mailbox-selection-list__icon">
				<MailboxItemIcon mailbox={ mailbox } />
			</span>
			<div className="mailbox-selection-list__mailbox">
				<h2>{ getEmailAddress( mailbox ) }</h2>
			</div>
		</Card>
	);
};

MailboxItem.propType = {
	mailbox: PropTypes.object.isRequired,
	key: PropTypes.string,
};

const MailboxItems = ( { mailboxes } ) => {
	const translate = useTranslate();

	return (
		<>
			<FormattedHeader
				align="center"
				brandFont
				className="mailbox-selection-list__header"
				headerText={ translate( 'Welcome to Inbox!' ) }
				subHeaderText={ translate( 'Choose the mailbox you’d like to open.' ) }
			/>

			{ mailboxes.map( ( mailbox, index ) => (
				<MailboxItem mailbox={ mailbox } key={ index } />
			) ) }
		</>
	);
};

MailboxItems.propType = {
	mailboxes: PropTypes.arrayOf( PropTypes.object ).isRequired,
};

const MailboxListStatus = ( { isError, statusMessage } ) => {
	return (
		<div className="mailbox-selection-list__status">
			<div className="mailbox-selection-list__status-content">
				<Gridicon icon={ isError ? 'cross-circle' : 'notice' } />
			</div>
			<div className="mailbox-selection-list__status-text">{ statusMessage }</div>
		</div>
	);
};

MailboxListStatus.propType = {
	isError: PropTypes.bool,
	statusMessage: PropTypes.node.isRequired,
};

const MailboxLoaderError = ( { refetchMailboxes, siteId } ) => {
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const reloadMailboxes = () => {
		queryClient.removeQueries( getMailboxesQueryKey( siteId ) );
		refetchMailboxes();
	};

	return (
		<div className="mailbox-selection-list__loader-error-container">
			<section>
				<img src={ errorIllustration } alt={ translate( 'Error image' ) } />
				<FormattedHeader
					align="center"
					brandFont
					headerText={ translate( "Something's broken" ) }
					subHeaderText={ translate(
						'There has been an error in loading your mailboxes. Please use the reload button, and reach out to support if the issue persists.'
					) }
				/>
				<footer>
					<Button primary onClick={ reloadMailboxes }>
						{ translate( 'Reload mailboxes' ) }
					</Button>
					<Button borderless primary href={ CALYPSO_CONTACT }>
						{ translate( 'Contact support' ) }
					</Button>
				</footer>
			</section>
		</div>
	);
};

MailboxLoaderError.propType = {
	refetchMailboxes: PropTypes.func.isRequired,
	siteId: PropTypes.number.isRequired,
};

const MailboxSelectionList = ( { domains } ) => {
	const dispatch = useDispatch();
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite?.ID ?? null;
	const translate = useTranslate();

	const {
		data: allMailboxes = [],
		isError,
		isLoading,
		refetch,
	} = useGetMailboxes( selectedSiteId, {
		retry: 2,
	} );

	useEffect( () => {
		const recorder = withEnhancers( recordPageView, [ enhanceWithSiteMainProduct ] );
		dispatch(
			recorder( emailManagementInbox( ':site' ), 'Inbox', undefined, {
				has_error: isError,
				context: 'mailbox-selection-list',
			} )
		);
	}, [ dispatch ] );

	if ( isLoading || selectedSiteId === null ) {
		return <ProgressLine statusText={ translate( 'Loading your mailboxes' ) } />;
	}

	if ( isError ) {
		return <MailboxLoaderError refetchMailboxes={ refetch } siteId={ selectedSiteId } />;
	}

	const mailboxes = allMailboxes.filter( ( mailbox ) => ! isEmailForwardAccount( mailbox ) );

	return (
		<div className="mailbox-selection-list__container">
			<div className="mailbox-selection-list">
				{ mailboxes.length > 0 ? (
					<>
						<MailboxItems mailboxes={ mailboxes } />
						<NewMailboxUpsell domains={ domains } />
					</>
				) : (
					<MailboxListStatus statusMessage={ translate( 'You have no mailboxes yet.' ) } />
				) }
			</div>
		</div>
	);
};

export default MailboxSelectionList;
