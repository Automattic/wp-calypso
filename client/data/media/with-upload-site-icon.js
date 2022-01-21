import { createHigherOrderComponent } from '@wordpress/compose';
import { useUploadSiteIcon } from './use-upload-site-icon';

export const withUploadSiteIcon = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const uploadSiteIcon = useUploadSiteIcon();
		return <Wrapped { ...props } uploadSiteIcon={ uploadSiteIcon } />;
	},
	'withUploadSiteIcon'
);
