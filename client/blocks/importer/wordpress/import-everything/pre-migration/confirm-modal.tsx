import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import ConfirmModal from 'calypso/blocks/importer/components/confirm-modal';

interface Props {
	sourceSiteSlug: string;
	targetSiteSlug: string;
	onClose: () => void;
	onConfirm: () => void;
}
const ConfirmModalPrompt: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { sourceSiteSlug, targetSiteSlug, onClose, onConfirm } = props;

	return (
		<ConfirmModal onClose={ () => onClose() } onConfirm={ () => onConfirm() }>
			<p>
				{ sprintf(
					/* translators: the `sourceSite` and `targetSite` fields could be any site URL (eg: "yourname.com") */
					__(
						'Your site %(sourceSite)s will be migrated to %(targetSite)s, overriding all the content in your destination site.'
					),
					{
						sourceSite: sourceSiteSlug,
						targetSite: targetSiteSlug,
					}
				) }
			</p>
		</ConfirmModal>
	);
};

export default ConfirmModalPrompt;
