import { Dialog } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { showDSP, usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import './style.scss';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export type BlazePressPromotionProps = {
	isVisible: boolean;
	siteId: string | number;
	postId: string | number;
	onClose: () => void;
};

const BlazePressWidget = ( props: BlazePressPromotionProps ) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
	const { isVisible = false, onClose = () => {} } = props;
	const [ isLoading, setIsLoading ] = useState( true );
	const [ showCancelDialog, setShowCancelDialog ] = useState( false );
	const widgetContainer = useRef< HTMLDivElement >( null );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	// Scroll to top on initial load regardless of previous page position
	useEffect( () => {
		if ( isVisible ) {
			window.scrollTo( 0, 0 );
		}
	}, [ isVisible ] );

	useEffect( () => {
		isVisible &&
			( async () => {
				if ( props.siteId === null || props.postId === null ) {
					return;
				}

				await showDSP(
					selectedSiteSlug,
					props.siteId,
					props.postId,
					onClose,
					widgetContainer.current
				);
				setIsLoading( false );
			} )();
	}, [ isVisible, onClose, props.postId, props.siteId, selectedSiteSlug ] );

	const cancelDialogButtons = [
		{
			action: 'cancel',
			label: __( 'No' ),
		},
		{
			action: 'close',
			isPrimary: true,
			label: __( 'Yes, cancel' ),
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
				<BlankCanvas className={ 'blazepress-widget' }>
					<div className={ 'blazepress-widget__header-bar' }>
						<WordPressLogo />
						<h2>Promote</h2>
						<span
							role="button"
							className={ 'blazepress-widget__cancel' }
							onKeyDown={ () => setShowCancelDialog( true ) }
							tabIndex={ 0 }
							onClick={ () => setShowCancelDialog( true ) }
						>
							Cancel
						</span>
					</div>
					<div
						className={
							isLoading ? 'blazepress-widget__content loading' : 'blazepress-widget__content'
						}
					>
						<Dialog
							isVisible={ showCancelDialog }
							buttons={ cancelDialogButtons }
							onClose={ () => setShowCancelDialog( false ) }
						>
							<h1>{ __( 'Cancel the campaign' ) }</h1>
							<p>
								{ __(
									'If you cancel now, you will lose any progress you have made. Are you sure you want to cancel?'
								) }
							</p>
						</Dialog>
						{ isLoading && <LoadingEllipsis /> }
						<div className={ 'blazepress-widget__widget-container' } ref={ widgetContainer }></div>
					</div>
				</BlankCanvas>
			) }
		</>
	);
};

export default BlazePressWidget;
