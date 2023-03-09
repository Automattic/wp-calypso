import { localizeUrl } from '@automattic/i18n-utils';
import { PureUniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import { useBlockProps } from '@wordpress/block-editor';
import { FooterAttributes } from './types';

const save = ( { attributes }: FooterAttributes ) => {
	const props = useBlockProps.save();
	return (
		<footer { ...props } data-locale={ attributes.locale }>
			<PureUniversalNavbarFooter locale={ attributes.locale } localizeUrl={ localizeUrl } />
		</footer>
	);
};

export default save;
