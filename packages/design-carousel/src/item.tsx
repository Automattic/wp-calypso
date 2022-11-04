/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { ThemePreview, Design } from '@automattic/design-picker';
import cx from 'classnames';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	design: Design;
	inlineCss?: string;
};

const getDesignPreviewUrl = ( design: Design ): string => {
	const params = new URLSearchParams( {
		stylesheet: design.recipe?.stylesheet || '',
		language: 'en',
		viewport_height: '1040',
		source_site: 'patternboilerplates.wordpress.com',
		use_screenshot_overrides: 'true',
		site_title: design.title,
	} );

	return `https://public-api.wordpress.com/wpcom/v2/block-previews/site?${ params }`;
};

export function Item( { style, design, className, inlineCss }: Props ) {
	const url = getDesignPreviewUrl( design );

	return (
		<div style={ style } className={ cx( 'design-carousel__item', className ) }>
			<ThemePreview url={ url } inlineCss={ inlineCss } />
			<div className="design-carousel__item-overlay"></div>
		</div>
	);
}
