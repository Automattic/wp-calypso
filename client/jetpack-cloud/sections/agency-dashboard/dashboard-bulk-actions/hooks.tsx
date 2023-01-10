import { useTranslate } from 'i18n-calypso';
import { ReactChild, useCallback } from 'react';
import acceptDialog from 'calypso/lib/accept';
import { useToggleActivateMonitor } from '../hooks';

const dialogContent = (
	heading: ReactChild,
	description: ReactChild,
	action: ( accepted: boolean ) => void
) => {
	const content = (
		<div>
			<div className="dashboard-bulk-actions-modal-heading">{ heading }</div>
			<span className="dashboard-bulk-actions-modal-desc">{ description }</span>
		</div>
	);
	const options = {
		additionalClassNames: 'dashboard-bulk-actions-modal',
	};
	return acceptDialog( content, action, heading, null, options );
};

export function useHandleToggleMonitor( selectedSites: Array< { blog_id: number; url: string } > ) {
	const translate = useTranslate();

	const toggleActivateMonitor = useToggleActivateMonitor( selectedSites );

	const toggleMonitor = useCallback(
		( accepted: boolean, activate: boolean ) => {
			if ( accepted ) {
				toggleActivateMonitor( activate );
			}
		},
		[ toggleActivateMonitor ]
	);

	const handleToggleActivateMonitor = useCallback(
		( activate: boolean ) => {
			const heading = activate ? translate( 'Resume Monitor' ) : translate( 'Pause Monitor' );
			const monitorAction = activate ? translate( 'resume' ) : translate( 'pause' );
			const siteCountText =
				selectedSites.length > 1
					? translate( '%(siteCount)d sites', {
							args: { siteCount: selectedSites.length },
							comment: '%(siteCount) is no of sites, e.g. "2 sites"',
					  } )
					: selectedSites[ 0 ].url;
			const content =
				selectedSites.length > 1
					? translate( 'You are about to %(monitorAction)s the monitor for %(siteCountText)s.', {
							args: { monitorAction, siteCountText },
							comment:
								"%(monitorAction)s is the monitor's currently performed action which could be either 'resume' or 'pause'. %(siteCountText) is no of sites, e.g. '2 sites'",
					  } )
					: translate(
							'You are about to %(monitorAction)s the monitor for {{em}}%(siteUrl)s{{/em}}.',
							{
								args: { monitorAction, siteUrl: siteCountText },
								comment:
									"%(monitorAction)s is the monitor's currently performed action which could be either 'resume' or 'pause'.",
								components: {
									em: <em />,
								},
							}
					  );

			return dialogContent( heading, content, ( accepted: boolean ) =>
				toggleMonitor( accepted, activate )
			);
		},
		[ selectedSites, toggleMonitor, translate ]
	);

	return handleToggleActivateMonitor;
}
