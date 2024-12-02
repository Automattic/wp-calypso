import { translate } from 'i18n-calypso';
import { Fragment, ReactNode, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FeatureExample from 'calypso/components/feature-example';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { Panel } from 'calypso/components/panel';
import HostingActivateStatus from 'calypso/hosting/server-settings/hosting-activate-status';
import { useDispatch, useSelector } from 'calypso/state';
import { transferInProgress } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

interface GitHubDeploymentsProps {
	topRightButton?: ReactNode;
	pageTitle: string;
	children: ReactNode;
}

export function PageShell( { topRightButton, pageTitle, children }: GitHubDeploymentsProps ) {
	const siteId = useSelector( getSelectedSiteId );
	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId as number ) );
	const dispatch = useDispatch();
	const transferState = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const [ hasTransfer, setHasTransferring ] = useState(
		!! (
			transferState &&
			transferInProgress.includes( transferState as ( typeof transferInProgress )[ number ] )
		)
	);
	const showHostingActivationBanner = ! isSiteAtomic && ! hasTransfer;

	const clickActivate = () => {
		dispatch( initiateThemeTransfer( siteId ?? 0, null, '', '', 'hosting' ) );
		setHasTransferring( true );
	};

	const getAtomicActivationNotice = () => {
		return (
			<Notice
				className="hosting__activating-notice"
				status="is-info"
				showDismiss={ false }
				text={ translate( 'Please activate hosting access to begin using this feature.' ) }
				icon="globe"
			>
				<NoticeAction onClick={ clickActivate }>{ translate( 'Activate' ) }</NoticeAction>
			</Notice>
		);
	};

	const onTick = ( isTransferring?: boolean ) => {
		if ( isTransferring && ! hasTransfer ) {
			setHasTransferring( true );
		}
	};

	const WrapperComponent = ! isSiteAtomic ? FeatureExample : Fragment;
	return (
		<Panel wide className="github-deployments tools-deployments">
			<DocumentHead title={ pageTitle } />
			<NavigationHeader
				compactBreadcrumb
				title={ translate( 'Deployments' ) }
				subtitle={ translate(
					'Automate updates from GitHub to streamline workflows. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: (
								<InlineSupportLink supportContext="github-deployments" showIcon={ false } />
							),
						},
					}
				) }
			>
				{ topRightButton }
			</NavigationHeader>
			{ showHostingActivationBanner && getAtomicActivationNotice() }
			{ ! showHostingActivationBanner && (
				<HostingActivateStatus
					context="hosting"
					onTick={ onTick }
					keepAlive={ ! isSiteAtomic && hasTransfer }
				/>
			) }
			<WrapperComponent>{ children }</WrapperComponent>
		</Panel>
	);
}
