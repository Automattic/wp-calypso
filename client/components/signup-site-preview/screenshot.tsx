/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import ImagePreloader from 'components/image-preloader';
import Spinner from 'components/spinner';
import classNames from 'classnames';

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
	const className = classNames( {
		'signup-site-preview__scrolling-screenshot': scrolling,
	} );

	const isPhone = defaultViewportDevice === 'phone';

	return (
		<div className={ className }>
			<ImagePreloader
				src={ screenshotUrl }
				placeholder={ <Spinner size={ isPhone ? 20 : 40 } /> }
				onClick={ () => onPreviewClick( defaultViewportDevice ) }
				onLoad={ ( e: any ) => setWrapperHeight( e.target.height ) }
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
