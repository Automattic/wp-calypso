import { useRef } from 'react';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import MediumImporter from 'calypso/signup/steps/import-from/medium';
import { ImporterWrapper } from '../importer-wrapper';
import { ImporterWrapperRefAttr } from '../importer-wrapper/types';
import './style.scss';

const ImporterBlogger: Step = function ( props ) {
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

export default ImporterBlogger;
