/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { MShotsImage } from '@automattic/onboarding';
import cx from 'classnames';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	design: any;
};

const getDesignPreviewUrl = ( design: any ): string => {
	const params = new URLSearchParams( {
		stylesheet: design.recipe?.stylesheet,
		language: 'en',
		viewport_height: '1040',
		source_site: 'patternboilerplates.wordpress.com',
		use_screenshot_overrides: 'true',
		site_title: design.title,
	} );

	return `https://public-api.wordpress.com/wpcom/v2/block-previews/site?${ params }`;
};

export function Item( { style, design, className }: Props ) {
	return (
		<div style={ style } className={ cx( 'design-carousel__item', className ) }>
			<MShotsImage
				url={ getDesignPreviewUrl( design ) }
				options={ { w: 1280, vpw: 1920, vph: 1280, format: 'png' } }
				alt={ design.title }
				aria-labelledby=""
			/>
		</div>
	);
}
