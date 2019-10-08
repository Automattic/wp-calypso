/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ImagePreloader from 'components/image-preloader';
import Spinner from 'components/spinner';
import classNames from 'classnames';

interface Props {
	isPhone: boolean;
	setWrapperHeight: ( height: number ) => void;
	screenshotUrl: string;
	scrolling: boolean;
	translate: typeof import('i18n-calypso').translate;
}

export default function SignupSitePreviewScreenshot( {
	isPhone,
	setWrapperHeight,
	scrolling,
	screenshotUrl,
	translate,
}: Props ) {
	const className = classNames( {
		'signup-site-preview__scrolling-screenshot': scrolling,
	} );

	return (
		<div className={ className }>
			<ImagePreloader
				src={ screenshotUrl }
				placeholder={ <Spinner size={ isPhone ? 20 : 40 } /> }
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
