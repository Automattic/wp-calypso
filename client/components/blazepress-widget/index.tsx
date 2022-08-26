import { useEffect, useRef, useState } from 'react';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { showDSP, usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';

import './style.scss';

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

				await showDSP( props.siteId, props.postId, widgetContainer.current, onClose );
				setIsLoading( false );
			} )();
	}, [ isVisible, onClose, props.postId, props.siteId ] );

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
