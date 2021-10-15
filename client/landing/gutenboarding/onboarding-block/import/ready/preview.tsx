import type * as React from 'react';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	website: string;
}

const protocolRgx = /(?<protocol>https?:\/\/)?(?<address>.*)/i;

const ImportPreview: React.FunctionComponent< Props > = ( { website } ) => {
	const mShotUrl = `https://s0.wp.com/mshots/v1/${ website }`;
	const websiteMatch = website.match( protocolRgx );

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
				<img src={ mShotUrl } alt="Website screenshot preview" className={ 'import__screenshot' } />
			</div>
		</div>
	);
};

export default ImportPreview;
