import { useRef } from 'react';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import WordpressImporter from 'calypso/signup/steps/import-from/wordpress';
import { ImporterWrapper } from '../importer';
import { ImporterWrapperRefAttr } from '../importer/types';
import './style.scss';

const ImporterWordpress: Step = function ( props ) {
	const wrapperRef = useRef< ImporterWrapperRefAttr >( null );
	const refObj = wrapperRef.current;

	return (
		<ImporterWrapper importer={ 'wordpress' } { ...props } ref={ wrapperRef }>
			{ refObj && (
				<WordpressImporter
					job={ refObj.job }
					siteId={ refObj.siteId }
					siteSlug={ refObj.siteSlug }
					fromSite={ refObj.fromSite }
					navigator={ refObj.navigator }
				/>
			) }
		</ImporterWrapper>
	);
};

export default ImporterWordpress;
