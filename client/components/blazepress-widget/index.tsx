import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { Dialog } from '@automattic/components';
import { useLocale, useLocalizeUrl } from '@automattic/i18n-utils';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { TranslateOptionsText, useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import BlazeLogo from 'calypso/components/blaze-logo';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { showDSP, usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import './style.scss';
import { useRouteModal } from 'calypso/lib/route-modal';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export type BlazePressPromotionProps = {
	isVisible: boolean;
	siteId: string | number;
	postId: string | number;
	keyValue: string;
	source?: string;
};

type BlazePressTranslatable = ( original: string, extra?: TranslateOptionsText ) => string;

export function goToOriginalEndpoint() {
	const { pathname } = getUrlParts( window.location.href );
	page( pathname );
}

const BlazePressWidget = ( props: BlazePressPromotionProps ) => {
	const isV2Widget = config.isEnabled( 'promote-post/redesign-i2' );
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const { isVisible = false, keyValue, siteId } = props;
	const [ isLoading, setIsLoading ] = useState( true );
	const [ showCancelDialog, setShowCancelDialog ] = useState( false );
	const [ showCancelButton, setShowCancelButton ] = useState( true );
	const [ hiddenHeader, setHiddenHeader ] = useState( isV2Widget ? false : true );
	const widgetContainer = useRef< HTMLDivElement >( null );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate() as BlazePressTranslatable;
	const localizeUrl = useLocalizeUrl();
	const previousRoute = useSelector( getPreviousRoute );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSiteId ) );
	const { closeModal } = useRouteModal( 'blazepress-widget', keyValue );
	const queryClient = useQueryClient();
	const localeSlug = useLocale();

	// Scroll to top on initial load regardless of previous page position
	useEffect( () => {
		if ( isVisible ) {
			window.scrollTo( 0, 0 );
		}
	}, [ isVisible ] );

	const handleShowCancel = ( show: boolean ) => setShowCancelButton( show );
	const handleShowTopBar = ( show: boolean ) => {
		setHiddenHeader( ! show );
	};

	const onClose = ( goToCampaigns?: boolean ) => {
		queryClient.invalidateQueries( [ 'promote-post-campaigns', siteId ] );
		if ( goToCampaigns ) {
			page( `/advertising/${ siteSlug }/campaigns` );
		} else {
			queryClient && queryClient.invalidateQueries( [ 'promote-post-campaigns', siteId ] );
			if ( previousRoute ) {
				closeModal();
			} else {
				goToOriginalEndpoint();
			}
		}
	};

	useEffect( () => {
		isVisible &&
			( async () => {
				if ( props.siteId === null || props.postId === null ) {
					return;
				}
				const source = props.source || 'blazepress';

				await showDSP(
					selectedSiteSlug,
					props.siteId,
					props.postId,
					onClose,
					source,
					( original: string, options?: TranslateOptionsText ): string => {
						if ( options ) {
							// This is a special case where we re-use the translate in another application
							// that is mounted inside calypso
							// eslint-disable-next-line wpcalypso/i18n-no-variables
							return translate( original, options );
						}
						// eslint-disable-next-line wpcalypso/i18n-no-variables
						return translate( original );
					},
					localizeUrl,
					widgetContainer.current,
					handleShowCancel,
					handleShowTopBar,
					localeSlug,
					isV2Widget
				);
				setIsLoading( false );
			} )();
	}, [ isVisible, props.postId, props.siteId, selectedSiteSlug ] );

	const cancelDialogButtons = [
		{
			action: 'cancel',
			isPrimary: true,
			label: translate( 'No, let me finish' ),
		},
		{
			action: 'close',
			label: translate( 'Yes, quit' ),
			onClick: async () => {
				setShowCancelDialog( false );
				onClose();
			},
		},
	];

	const promoteWidgetStatus = usePromoteWidget();
	if ( promoteWidgetStatus === PromoteWidgetStatus.DISABLED ) {
		return <></>;
	}

	return (
		<>
			{ isVisible && (
				<BlankCanvas
					className={ classNames( 'blazepress-widget', {
						'hidden-header': hiddenHeader,
						'blazepress-widget-v2': isV2Widget,
					} ) }
				>
					<div className="blazepress-widget__header-bar">
						<BlazeLogo />
						<h2>{ translate( 'Blaze' ) }</h2>
						{ showCancelButton && (
							<span
								role="button"
								className="blazepress-widget__cancel"
								onKeyDown={ () => setShowCancelDialog( true ) }
								tabIndex={ 0 }
								onClick={ () => setShowCancelDialog( true ) }
							>
								{ translate( 'Cancel' ) }
							</span>
						) }
					</div>
					<div
						className={
							isLoading ? 'blazepress-widget__content loading' : 'blazepress-widget__content'
						}
					>
						<Dialog
							additionalOverlayClassNames="blazepress-widget"
							isVisible={ showCancelDialog && showCancelButton }
							buttons={ cancelDialogButtons }
							onClose={ () => setShowCancelDialog( false ) }
						>
							<h1>{ translate( 'Are you sure you want to quit?' ) }</h1>
							<p>{ translate( 'All progress in this session will be lost.' ) }</p>
						</Dialog>
						{ isLoading && <LoadingEllipsis /> }
						<div className="blazepress-widget__widget-container" ref={ widgetContainer }></div>
					</div>
				</BlankCanvas>
			) }
		</>
	);
};

export default BlazePressWidget;
