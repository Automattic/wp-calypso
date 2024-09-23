import { type FC } from 'react';
import ListStep from 'calypso/blocks/import/list';
import { type StepProps } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ImportWrapper } from '../import';
import { getFinalImporterUrl } from '../import/helper';

interface ImportListProps extends StepProps {
	title?: string;
	subTitle?: string;
	skipTracking?: boolean;
}

const ImportList: FC< ImportListProps > = function ImportStep( props ) {
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
