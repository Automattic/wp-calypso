/**
 * External dependencies
 */
import { noop } from 'lodash';
import React, { useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import Spinner from 'calypso/components/spinner';
import classNames from 'classnames';
import photon from 'photon';

interface Props {
	defaultViewportDevice: string;
	setWrapperHeight: ( height: number ) => void;
	screenshotUrl: string;
	scrolling: boolean;
	onPreviewClick: ( viewportSize: string ) => void;
	translate: typeof import('i18n-calypso').translate;
}

export default function SignupSitePreviewScreenshot( {
	defaultViewportDevice,
	setWrapperHeight,
	scrolling,
	screenshotUrl,
	onPreviewClick = noop,
	translate,
}: Props ) {
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		setIsLoading( true );
	}, [ screenshotUrl ] );

	const className = classNames( {
		'signup-site-preview__scrolling-screenshot': scrolling,
	} );

	const isPhone = defaultViewportDevice === 'phone';
	const zoom = window.devicePixelRatio;
	const width = isPhone ? 280 : 904;

	const onLoad = ( event: React.SyntheticEvent< HTMLImageElement > ) => {
		setWrapperHeight( event.currentTarget.height );
		setIsLoading( false );
	};

	return (
		<div className={ className }>
			{ isLoading && (
				<Spinner className="signup-site-preview__screenshot-spinner" size={ isPhone ? 20 : 40 } />
			) }
			{ /* The onClick is being used for analytics purposes, there's no user interaction implemented with this click handler */ }
			{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */ }
			<img
				style={ isLoading ? { display: 'none' } : undefined }
				src={ photon( screenshotUrl, { width } ) }
				srcSet={ photon( screenshotUrl, { width, zoom } ) + ` ${ zoom }x` }
				onClick={ () => onPreviewClick( defaultViewportDevice ) }
				onLoad={ onLoad }
				alt={
					isPhone
						? translate( 'Preview of site with phone layout', {
								comment: 'alt text of site preview',
						  } )
						: translate( 'Preview of site with desktop layout', {
								comment: 'alt text of site preview',
						  } )
				}
			/>
		</div>
	);
}
