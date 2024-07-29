/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { getDesignPreviewUrl } from '@automattic/design-picker';
import { MShotsImage, MShotsOptions } from '@automattic/onboarding';
import clsx from 'clsx';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	design: any;
	options: MShotsOptions;
};

export function Item( { style, design, className, options }: Props ) {
	return (
		<div style={ style } className={ clsx( 'design-carousel__item', className ) }>
			<MShotsImage
				url={ getDesignPreviewUrl( design, {
					use_screenshot_overrides: true,
				} ) }
				options={ options }
				alt={ design.title }
				aria-labelledby=""
			/>
		</div>
	);
}
