import { localizeUrl } from '@automattic/i18n-utils';
import { PureUniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import { useBlockProps } from '@wordpress/block-editor';

const save = () => {
	const props = useBlockProps.save();

	return (
		<footer { ...props }>
			<PureUniversalNavbarFooter localizeUrl={ localizeUrl } />
		</footer>
	);
};

export default save;
