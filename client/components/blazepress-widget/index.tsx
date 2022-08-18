import { Gridicon } from '@automattic/components';
import { useEffect, useRef, useState } from 'react';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { showDSP } from 'calypso/lib/promote-post';

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

	useEffect( () => {
		isVisible &&
			( async () => {
				if ( props.siteId === null || props.postId === null ) {
					return;
				}

				await showDSP( props.siteId, props.postId, widgetContainer.current );
				setIsLoading( false );
			} )();
	}, [ isVisible ] );
	return (
		<>
			{ isVisible && (
				<BlankCanvas className={ 'blazepress-widget' }>
					<div className={ 'blazepress-widget__header-bar' }>
						<WordPressLogo />
						<h2>Promote</h2>
						<span
							role="button"
							className={ 'blazepress-widget__cross' }
							onKeyDown={ onClose }
							tabIndex={ 0 }
							onClick={ onClose }
						>
							<Gridicon icon="cross" size={ 24 } />
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
