import { useRef } from 'react';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import WixImporter from 'calypso/signup/steps/import-from/wix';
import { ImporterWrapper } from '../importer-wrapper';
import { ImporterWrapperRefAttr } from '../importer-wrapper/types';
import './style.scss';

const ImporterWix: Step = function ( props ) {
	const wrapperRef = useRef< ImporterWrapperRefAttr >();
	const refObj = wrapperRef.current;

	return (
		<ImporterWrapper importer={ 'wordpress' } { ...props } ref={ wrapperRef }>
			{ refObj && (
				<WixImporter
					job={ refObj.job }
					run={ refObj.run }
					siteId={ refObj.siteId }
					siteSlug={ refObj.siteSlug }
					fromSite={ refObj.fromSite }
				/>
			) }
		</ImporterWrapper>
	);
};

export default ImporterWix;
