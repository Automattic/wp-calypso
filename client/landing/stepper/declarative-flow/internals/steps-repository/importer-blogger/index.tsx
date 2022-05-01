import { useRef } from 'react';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import BloggerImporter from 'calypso/signup/steps/import-from/blogger';
import { ImporterWrapper } from '../importer';
import { ImporterWrapperRefAttr } from '../importer/types';
import './style.scss';

const ImporterBlogger: Step = function ( props ) {
	const wrapperRef = useRef< ImporterWrapperRefAttr >( null );
	const refObj = wrapperRef.current;

	return (
		<ImporterWrapper importer={ 'blogger' } { ...props } ref={ wrapperRef }>
			{ refObj && (
				<BloggerImporter
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
