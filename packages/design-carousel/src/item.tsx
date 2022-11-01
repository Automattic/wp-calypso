/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { MShotsImage, MShotsOptions } from '@automattic/onboarding';
import cx from 'classnames';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	design: any;
	type: 'desktop' | 'mobile';
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

export function Item( { style, design, className, type }: Props ) {
	// Default to mobile options
	let options: MShotsOptions = { w: 400, vpw: 400, vph: 872, format: 'png' };

	if ( type === 'desktop' ) {
		options = { w: 1280, vpw: 1920, vph: 1280, format: 'png' };
	}

	return (
		<div style={ style } className={ cx( 'design-carousel__item', className ) }>
			<MShotsImage
				url={ getDesignPreviewUrl( design ) }
				options={ options }
				alt={ design.title }
				aria-labelledby=""
			/>
		</div>
	);
}
