import { translate } from 'i18n-calypso';
import React from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import type { Importer } from 'calypso/blocks/importer/types';

interface Props {
	text?: string;
	importer: Importer;
	supportLinkModal?: boolean;
}
const SupportLink: React.FunctionComponent< Props > = ( props ) => {
	const { text, importer, supportLinkModal } = props;

	return (
		<InlineSupportLink
			showIcon={ false }
			supportContext={ `importers-${ importer }` }
			showSupportModal={ supportLinkModal }
		>
			{ text || translate( 'Need help exporting your content?' ) }
		</InlineSupportLink>
	);
};

export default SupportLink;
