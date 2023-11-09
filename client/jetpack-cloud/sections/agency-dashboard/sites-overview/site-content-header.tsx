import { Fragment } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import JetpackPersistentNotifications from 'calypso/jetpack-cloud/sections/partner-portal/persistent-notifications';
import { warningPartnerPortalPersistentNotice } from 'calypso/jetpack-cloud/sections/partner-portal/persistent-notifications/actions';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { warningNotice } from 'calypso/state/notices/actions';
import type { ReactNode } from 'react';

const CALYPSO_MASTERBAR_HEIGHT = 47;

interface Props {
	pageTitle: string;
	showStickyContent: boolean;
	content: ReactNode;
}

export default function SiteContentHeader( { content, pageTitle, showStickyContent }: Props ) {
	const [ divRef, hasCrossed ] = useDetectWindowBoundary( CALYPSO_MASTERBAR_HEIGHT );

	const outerDivProps = divRef ? { ref: divRef as React.RefObject< HTMLDivElement > } : {};
	const translate = useTranslate();

	const dispatch = useDispatch();
	dispatch(
		warningNotice( 'SOMEOMREOMROEMd', {
			duration: 8000,
			showDismiss: true,
			displayOnNextPage: true,
		} )
	);

	dispatch(
		warningPartnerPortalPersistentNotice( 'PARTNER NOTICE PARTNER NOTICE', {
			duration: 8000,
			showDismiss: true,
			displayOnNextPage: true,
		} )
	);

	return (
		<Fragment>
			<JetpackPersistentNotifications />
			<div style={ { border: '1px solid red' } }></div>

			<div className="sites-overview__viewport" { ...outerDivProps }>
				<div style={ { border: '1px solid red' } }></div>
				<div
					className={ classNames( 'sites-overview__page-title-container', {
						'is-sticky': showStickyContent && hasCrossed,
					} ) }
				>
					<div className="sites-overview__page-heading">
						<h2 className="sites-overview__page-title">{ pageTitle }</h2>
						<div className="sites-overview__page-subtitle">
							{ translate( 'Manage all your Jetpack sites from one location' ) }
						</div>
					</div>

					{ content }
				</div>
			</div>
		</Fragment>
	);
}
