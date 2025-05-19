import { __ } from '@wordpress/i18n';
import ListStep from 'calypso/blocks/import/list';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { shouldUseStepContainerV2ImportFlow } from '../../../helpers/should-use-step-container-v2';
import { ImportWrapper } from '../import';
import { getFinalImporterUrl } from '../import/helper';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

const ImportList: Step< {
	submits: {
		platform: ImporterPlatform;
		url: string;
	};
	accepts: {
		title?: string;
		subTitle?: string;
		skipTracking?: boolean;
	};
} > = function ImportStep( props ) {
	const siteSlug = useSiteSlug();
	const { navigation, flow } = props;
	const useContainerV2 = shouldUseStepContainerV2ImportFlow( flow );

	const text = __( 'Import content from another platform or file' );
	const subText = __( "Select the platform you're coming from" );

	return (
		<ImportWrapper { ...props } text={ text } subText={ subText }>
			<ListStep
				siteSlug={ siteSlug }
				submit={ navigation.submit }
				getFinalImporterUrl={ getFinalImporterUrl }
				{ ...props }
				renderHeading={ ! useContainerV2 }
				title={ text }
				subTitle={ subText }
			/>
		</ImportWrapper>
	);
};

export default ImportList;
