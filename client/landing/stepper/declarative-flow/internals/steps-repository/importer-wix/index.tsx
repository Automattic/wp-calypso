import { useRef } from 'react';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import WixImporter from 'calypso/signup/steps/import-from/wix';
import { ImporterWrapper } from '../importer';
import { ImporterWrapperRefAttr } from '../importer/types';
import './style.scss';

const ImporterWix: Step = function ( props ) {
	const wrapperRef = useRef< ImporterWrapperRefAttr >();
	const refObj = wrapperRef.current;

	return (
		<ImporterWrapper importer={ 'wix' } { ...props } ref={ wrapperRef }>
			{ refObj && (
				<WixImporter
					job={ refObj.job }
					run={ refObj.run }
					siteId={ refObj.siteId }
					siteSlug={ refObj.siteSlug }
					fromSite={ refObj.fromSite }
					navigator={ refObj.navigator }
				/>
			) }
		</ImporterWrapper>
	);
};

export default ImporterWix;
