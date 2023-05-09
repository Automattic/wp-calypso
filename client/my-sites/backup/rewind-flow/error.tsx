import { Button, Gridicon } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';

interface Props {
	imgSrc?: string;
	imgAlt?: string;
	errorText?: TranslateResult;
	siteUrl: string;
}

const RewindFlowError: FunctionComponent< Props > = ( {
	errorText,
	siteUrl,
	children,
	imgSrc = '/calypso/images/illustrations/jetpack-cloud-download-failure.svg',
	imgAlt = 'jetpack cloud error',
} ) => {
	const translate = useTranslate();
	return (
		<>
			<div className="rewind-flow__header">
				<img src={ imgSrc } alt={ imgAlt } />
			</div>
			{ errorText && <h3 className="rewind-flow__title">{ errorText }</h3> }
			{ children }
			<Button
				className="rewind-flow__primary-button"
				href={ contactSupportUrl( siteUrl, 'error' ) }
				primary
				rel="noopener noreferrer"
				target="_blank"
			>
				{ translate( 'Contact support {{externalIcon/}}', {
					components: { externalIcon: <Gridicon icon="external" size={ 24 } /> },
				} ) }
			</Button>
		</>
	);
};

export default RewindFlowError;
