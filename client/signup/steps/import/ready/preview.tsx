import { memo } from 'react';
import type { FunctionComponent } from 'react';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	website: string;
}

const protocolRgx = /(?<protocol>https?:\/\/)?(?<address>.*)/i;

const ImportPreview: FunctionComponent< Props > = ( { website } ) => {
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
								<div dir="ltr">
									<span>{ websiteMatch?.groups?.protocol }</span>
									{ websiteMatch?.groups?.address }
								</div>
							</div>
						) }
					</div>
				}
				{ /* iframe-mask is a transparent cover it disallows the user to navigate inside iframed website */ }
				<div className="import__preview-iframe-mask" />
				<iframe
					title={ 'Preview' }
					className="import__preview-iframe"
					src={ website }
					loading="eager"
				/>
			</div>
		</div>
	);
};

export default memo(
	ImportPreview,
	( prevProps: Props, nextProps: Props ) => prevProps?.website === nextProps?.website
);
