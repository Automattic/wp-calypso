import { TranslateOptionsText, useTranslate } from 'i18n-calypso';
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
	const widgetContainer = useRef< HTMLDivElement >( null );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

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
					( original: string, options?: any ): string => {
						if ( options ) {
							/* eslint-disable wpcalypso/i18n-no-variables, @typescript-eslint/ban-ts-comment */
							// @ts-ignore
							return translate( original, options as TranslateOptionsText );
							/* eslint-enable wpcalypso/i18n-no-variables, @typescript-eslint/ban-ts-comment */
						}
						// eslint-disable-next-line wpcalypso/i18n-no-variables
						return translate( original );
					},
					widgetContainer.current
				);
				setIsLoading( false );
			} )();
	}, [ isVisible, props.postId, props.siteId ] );

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
							onKeyDown={ onClose }
							tabIndex={ 0 }
							onClick={ onClose }
						>
							Cancel
						</span>
					</div>
					<div
						className={
							isLoading ? 'blazepress-widget__content loading' : 'blazepress-widget__content'
						}
					>
						{ isLoading && <LoadingEllipsis /> }
						<div ref={ widgetContainer }></div>
					</div>
				</BlankCanvas>
			) }
		</>
	);
};

export default BlazePressWidget;
