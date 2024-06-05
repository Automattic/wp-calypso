import page from '@automattic/calypso-router';
import { getUrlParts } from '@automattic/calypso-url';
import { Dialog } from '@automattic/components';
import { useLocale, useLocalizeUrl } from '@automattic/i18n-utils';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import {
	showDSP,
	usePromoteWidget,
	PromoteWidgetStatus,
	cleanupDSP,
	useDspOriginProps,
} from 'calypso/lib/promote-post';
import './style.scss';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getAdvertisingDashboardPath } from 'calypso/my-sites/promote-post-i2/utils';
import { useSelector } from 'calypso/state';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export type BlazePressPromotionProps = {
	isVisible: boolean;
	siteId: string | number;
	postId: string | number;
	keyValue: string;
	source?: string;
};

export function goToOriginalEndpoint() {
	const { pathname } = getUrlParts( window.location.href );
	const index = pathname.indexOf( '/promote/' );
	page( index < 0 ? pathname : pathname.replace( /\/promote\/.*?\//, '/' ) );
}

const BlazePressWidget = ( props: BlazePressPromotionProps ) => {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const { isVisible = false, keyValue, siteId } = props;
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState( false );
	const [ showCancelDialog, setShowCancelDialog ] = useState( false );
	const [ showCancelButton, setShowCancelButton ] = useState( true );
	const [ hiddenHeader, setHiddenHeader ] = useState( true );
	const widgetContainer = useRef< HTMLDivElement >( null );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();
	const previousRoute = useSelector( getPreviousRoute );
	const selectedSite = useSelector( getSelectedSite );
	const jetpackVersion = selectedSite?.options?.jetpack_version;
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedSite?.ID ) );
	const { closeModal } = useRouteModal( 'blazepress-widget', keyValue );
	const queryClient = useQueryClient();
	const localeSlug = useLocale();
	const dspOriginProps = useDspOriginProps();
	const dispatch = useDispatch();

	// Scroll to top on initial load regardless of previous page position
	useEffect( () => {
		if ( isVisible ) {
			window.scrollTo( 0, 0 );
		}
	}, [ isVisible ] );

	useEffect( () => {
		return () => {
			// Execute Widget Cleanup function
			cleanupDSP();
		};
	}, [] );

	const handleShowCancel = ( show: boolean ) => setShowCancelButton( show );
	const handleShowTopBar = ( show: boolean ) => {
		setHiddenHeader( ! show );
	};

	const onClose = ( goToCampaigns?: boolean ) => {
		queryClient.invalidateQueries( {
			queryKey: [ 'promote-post-campaigns', siteId ],
		} );
		if ( goToCampaigns ) {
			page( getAdvertisingDashboardPath( `/campaigns/${ siteSlug }` ) );
		} else {
			queryClient &&
				queryClient.invalidateQueries( {
					queryKey: [ 'promote-post-campaigns', siteId ],
				} );
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

				try {
					await showDSP(
						selectedSiteSlug,
						props.siteId,
						props.postId,
						onClose,
						source,
						translate,
						localizeUrl,
						widgetContainer.current,
						handleShowCancel,
						handleShowTopBar,
						localeSlug,
						jetpackVersion,
						dispatch,
						dspOriginProps
					);
				} catch ( error ) {
					setError( true );
					setHiddenHeader( false );
				}
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
					className={ clsx( 'blazepress-widget', 'blazepress-i2', {
						'hidden-header': hiddenHeader,
					} ) }
				>
					<BlankCanvas.Header
						className={ clsx( 'blazepress-widget__header-bar', {
							'no-back-button': ! showCancelButton,
						} ) }
						onBackClick={ () => {
							if ( error ) {
								// Close without dialog if we are displaying the error page (no need to confirmation there)
								setShowCancelDialog( false );
								onClose();
							} else {
								setShowCancelDialog( true );
							}
						} }
					>
						<h2>{ translate( 'Blaze - Powered by Jetpack' ) }</h2>
					</BlankCanvas.Header>

					<div className={ clsx( 'blazepress-widget__content', { loading: isLoading } ) }>
						<Dialog
							showCloseIcon
							additionalOverlayClassNames="blazepress-widget"
							isVisible={ showCancelDialog && showCancelButton }
							buttons={ cancelDialogButtons }
							onClose={ () => setShowCancelDialog( false ) }
						>
							<h1>{ translate( 'Are you sure you want to quit?' ) }</h1>
							<p>
								{ translate(
									'If you quit, all of the work that has been done during this session will be lost.'
								) }
							</p>
						</Dialog>
						{ isLoading && <LoadingEllipsis /> }
						{ error && (
							<div className="error-notice">
								<h3 className="error-notice__title">
									{ translate( 'Oops, something went wrong' ) }
								</h3>
								<p className="error-notice__body">
									{ translate( 'Please try again soon or {{a}}contact support{{/a}} for help.', {
										components: {
											a: (
												<a
													href="https://wordpress.com/help/contact"
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										},
									} ) }
								</p>
							</div>
						) }
						<div className="blazepress-widget__widget-container" ref={ widgetContainer }></div>
					</div>
				</BlankCanvas>
			) }
		</>
	);
};

export default BlazePressWidget;
