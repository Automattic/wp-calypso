import { useRef } from 'react';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import MediumImporter from 'calypso/signup/steps/import-from/medium';
import { ImporterWrapper } from '../importer';
import { ImporterWrapperRefAttr } from '../importer/types';
import './style.scss';

const ImporterMedium: Step = function ( props ) {
	const wrapperRef = useRef< ImporterWrapperRefAttr >();
	const refObj = wrapperRef.current;

	return (
		<ImporterWrapper importer={ 'medium' } { ...props } ref={ wrapperRef }>
			{ refObj && (
				<MediumImporter
					run={ refObj.run }
					job={ refObj.job }
					siteId={ refObj.siteId }
					site={ refObj.site }
					siteSlug={ refObj.siteSlug }
					fromSite={ refObj.fromSite }
					urlData={ refObj.urlData }
				/>
			) }
		</ImporterWrapper>
	);
};

export default ImporterMedium;
