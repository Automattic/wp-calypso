import { Button, Card, Gridicon } from '@automattic/components';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import {
	getCacheKey as getMailboxesQueryKey,
	useGetMailboxes,
} from 'calypso/data/emails/use-get-mailboxes';
import errorIllustration from 'calypso/landing/browsehappy/illustration.svg';
import { ResponseDomain } from 'calypso/lib/domains/types';
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
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import NewMailboxUpsell from 'calypso/my-sites/email/mailboxes/new-mailbox-upsell';
import { getMailboxesPath } from 'calypso/my-sites/email/paths';
import { useDispatch as useCalypsoDispatch } from 'calypso/state';
import { recordPageView, enhanceWithSiteMainProduct } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { withEnhancers } from 'calypso/state/utils';
import ProgressLine from './progress-line';

/**
 * Import styles
 */
import './style.scss';

type Mailbox = {
	account_type: string;
	domain: string;
	mailbox: string;
};

const getExternalUrl = ( mailbox: Mailbox, titanAppsUrlPrefix: string ) => {
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

const MailboxItemIcon = ( { mailbox }: { mailbox: Mailbox } ) => {
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

const getProvider = ( mailbox: Mailbox ) => {
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

const trackAppLaunchEvent = ( {
	mailbox,
	app,
	context,
}: {
	mailbox: Mailbox;
	app: string;
	context: string;
} ) => {
	const provider = getProvider( mailbox ) ?? '';
	recordEmailAppLaunchEvent( {
		app,
		context,
		provider,
	} );
};

const MailboxItem = ( { mailbox }: { mailbox: Mailbox } ) => {
	const titanAppsUrlPrefix = useTitanAppsUrlPrefix();

	if ( isEmailForwardAccount( mailbox ) ) {
		return null;
	}

	return (
		<Card
			onClick={ () =>
				trackAppLaunchEvent( { mailbox, app: 'webmail', context: 'mailbox-selection' } )
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

const MailboxItems = ( { mailboxes }: { mailboxes: Mailbox[] } ) => {
	const translate = useTranslate();
	const dispatch = useCalypsoDispatch();
	useEffect( () => {
		// Email checkoug provides the /mailbox route with a new email param, e.g. /mailboxes/example.com?new-email=example@example.com`
		const queryParams = new URLSearchParams( window.location.search );
		const newEmail = queryParams.get( 'new-email' );
		if ( ! newEmail ) {
			return;
		}
		dispatch(
			successNotice( translate( 'Your new mailbox has been created.' ), {
				duration: 5000,
			} )
		);
	}, [] );

	return (
		<>
			<FormattedHeader
				align="center"
				brandFont
				className="mailbox-selection-list__header"
				headerText={ translate( 'My Mailboxes' ) }
				subHeaderText={ translate( 'Choose the mailbox you’d like to open.' ) }
			/>

			{ mailboxes.map( ( mailbox, index ) => (
				<MailboxItem mailbox={ mailbox } key={ index } />
			) ) }
		</>
	);
};

const MailboxListStatus = ( {
	isError = false,
	statusMessage,
}: {
	isError?: boolean;
	statusMessage: ReactNode;
} ) => {
	return (
		<div className="mailbox-selection-list__status">
			<div className="mailbox-selection-list__status-content">
				<Gridicon icon={ isError ? 'cross-circle' : 'notice' } />
			</div>
			<div className="mailbox-selection-list__status-text">{ statusMessage }</div>
		</div>
	);
};

const MailboxLoaderError = ( {
	reFetchMailboxes,
	siteId,
}: {
	reFetchMailboxes: () => void;
	siteId: number;
} ) => {
	const translate = useTranslate();
	const queryClient = useQueryClient();

	const reloadMailboxes = () => {
		queryClient.removeQueries( { queryKey: getMailboxesQueryKey( siteId ) } );
		reFetchMailboxes();
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

const MailboxSelectionList = ( { domains }: { domains: ResponseDomain[] } ) => {
	const dispatch = useDispatch() as ThunkDispatch< any, any, AnyAction >;
	const selectedSiteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();

	const {
		data: allMailboxes = [],
		isError,
		isLoading,
		refetch,
	} = useGetMailboxes( selectedSiteId ?? 0, {
		retry: 2,
	} );

	useEffect( () => {
		const recorder = withEnhancers( recordPageView, [ enhanceWithSiteMainProduct ] );
		dispatch(
			recorder( getMailboxesPath( ':site' ), 'Mailboxes', undefined, {
				has_error: isError,
				context: 'mailbox-selection-list',
			} )
		);
	}, [ dispatch ] );

	if ( isLoading || selectedSiteId === null ) {
		return <ProgressLine statusText={ translate( 'Loading your mailboxes' ) } />;
	}

	if ( isError ) {
		return <MailboxLoaderError reFetchMailboxes={ refetch } siteId={ selectedSiteId } />;
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
