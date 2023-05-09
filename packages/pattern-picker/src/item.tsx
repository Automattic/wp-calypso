/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { getDesignPreviewUrl } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { MShotsImage } from '@automattic/onboarding';
import cx from 'classnames';
import type { Design } from '@automattic/design-picker';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	design: Design;
};

export function Item( { style, design, className }: Props ) {
	return (
		<div style={ style } className={ cx( 'pattern-picker__item', className ) }>
			<MShotsImage
				url={ getDesignPreviewUrl( design, {
					language: useLocale(),
					use_screenshot_overrides: true,
				} ) }
				options={ { w: 400, vpw: 400, vph: 872, format: 'png' } }
				alt={ design.title }
				aria-labelledby=""
			/>
		</div>
	);
}
