import { translate } from 'i18n-calypso';
import React from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import type { Importer } from 'calypso/signup/steps/import-from/types';

interface Props {
	importer: Importer;
	supportLinkModal?: boolean;
}
const SupportLink: React.FunctionComponent< Props > = ( props ) => {
	const { importer, supportLinkModal } = props;

	return (
		<InlineSupportLink
			showIcon={ false }
			supportContext={ `importers-${ importer }` }
			showSupportModal={ supportLinkModal }
		>
			{ translate( 'Need help exporting your content?' ) }
		</InlineSupportLink>
	);
};

export default SupportLink;
