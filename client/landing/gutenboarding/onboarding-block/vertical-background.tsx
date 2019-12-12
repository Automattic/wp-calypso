/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';

export interface VerticalBackgroundProps {
	id: string;
	onLoad: () => void;
}

const VerticalBackground: FunctionComponent< VerticalBackgroundProps > = ( { id, onLoad } ) => {
	const [ imageId, setimageId ] = useState( '' );

	return (
		<>
			<img
				style={ { display: 'none' } }
				src={ `/calypso/images/verticals/${ id }.jpg` }
				onLoad={ () => {
					setimageId( id );
					onLoad();
				} }
				onError={ () => setimageId( 'default' ) }
				alt=""
			/>
			<SwitchTransition mode="in-out">
				<CSSTransition
					key={ imageId }
					timeout={ 1000 }
					classNames="onboarding-block__background-fade"
				>
					<div
						className="onboarding-block__background"
						style={ {
							backgroundImage: imageId.length
								? `url('/calypso/images/verticals/${ imageId }.jpg')`
								: 'none',
						} }
					/>
				</CSSTransition>
			</SwitchTransition>
		</>
	);
};
export default VerticalBackground;
