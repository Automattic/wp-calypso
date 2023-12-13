import React from 'react';
import ListStep from 'calypso/blocks/import/list';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ImportWrapper } from '../import';
import { getFinalImporterUrl } from '../import/helper';

const ImportList: Step = function ImportStep( props ) {
	const siteSlug = useSiteSlug();
	const { navigation } = props;

	return (
		<ImportWrapper { ...props }>
			<ListStep
				siteSlug={ siteSlug }
				submit={ navigation?.submit }
				getFinalImporterUrl={ getFinalImporterUrl }
				{ ...props }
			/>
		</ImportWrapper>
	);
};

export default ImportList;
