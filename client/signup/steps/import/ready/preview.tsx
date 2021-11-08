import { useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { MShotParams } from '../types';
import useWindowDimensions from '../windowDimensions.effect';
import type { FunctionComponent } from 'react';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	website: string;
}

const protocolRgx = /(?<protocol>https?:\/\/)?(?<address>.*)/i;

const ImportPreview: FunctionComponent< Props > = ( { website } ) => {
	const [ mShotUrl, setMShotUrl ] = useState( '' );
	const { width } = useWindowDimensions();
	const mShotParams: MShotParams = {
		scale: 2,
		vpw: width <= 640 ? 640 : undefined,
	};
	const websiteMatch = website.match( protocolRgx );

	const checkScreenshot = ( screenShotUrl: string ) => {
		const http = new XMLHttpRequest();
		http.open( 'GET', screenShotUrl );
		http.onreadystatechange = () => {
			if ( http.readyState !== http.HEADERS_RECEIVED ) {
				return;
			}

			if ( http.getResponseHeader( 'Content-Type' ) !== 'image/jpeg' ) {
				setTimeout( () => {
					checkScreenshot( screenShotUrl );
				}, 5000 );
			} else {
				setMShotUrl( screenShotUrl );
			}
		};
		http.send();
	};

	checkScreenshot(
		`https://s0.wp.com/mshots/v1/${ website }?${ Object.keys( mShotParams )
			.filter( ( key ) => !! mShotParams[ key as keyof MShotParams ] )
			.map( ( key ) => key + '=' + mShotParams[ key as keyof MShotParams ] )
			.join( '&' ) }`
	);

	const Screenshot = () => {
		if ( mShotUrl !== '' ) {
			return (
				<img src={ mShotUrl } alt="Website screenshot preview" className={ 'import__screenshot' } />
			);
		}

		return (
			<div className="import__screenshot-loading">
				<LoadingEllipsis />
			</div>
		);
	};

	return (
		<div className={ `import__preview` }>
			<div className="import__preview-wrapper">
				{
					<div role="presentation" className="import__preview-bar">
						<div role="presentation" className="import__preview-bar-dot" />
						<div role="presentation" className="import__preview-bar-dot" />
						<div role="presentation" className="import__preview-bar-dot" />
						{ websiteMatch && (
							<div className="import__preview-url-field">
								<div>
									<span>{ websiteMatch?.groups?.protocol }</span>
									{ websiteMatch?.groups?.address }
								</div>
							</div>
						) }
					</div>
				}
				<Screenshot />
			</div>
		</div>
	);
};

export default ImportPreview;
