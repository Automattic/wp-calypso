/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { MShotsImage } from '@automattic/onboarding';
import cx from 'classnames';
import { Pattern } from './types';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	onClick: () => void;
	pattern: Pattern;
};

const getPatternPreviewUrl = ( pattern: Pattern ): string => {
	const params = new URLSearchParams();

	params.set( 'stylesheet', 'pub/lynx' );
	params.set( 'pattern_id', pattern.name );

	if ( pattern.siteTitle ) {
		params.set( 'site_title', pattern.siteTitle );
	}

	if ( pattern.siteTagline ) {
		params.set( 'site_tagline', pattern.siteTagline );
	}

	if ( pattern.siteLogoUrl ) {
		params.set( 'site_logo_url', pattern.siteLogoUrl );
	}

	return `https://public-api.wordpress.com/wpcom/v2/block-previews/pattern?${ params }`;
};

export function Item( { style, onClick, pattern, className }: Props ) {
	return (
		<div>
			<button
				onClick={ onClick }
				style={ style }
				className={ cx( 'pattern-picker__item', className ) }
			>
				<div className="pattern-picker__item-iframe-wrapper">
					<MShotsImage
						url={ getPatternPreviewUrl( pattern ) }
						options={ { w: 512, vpw: 512, vph: 1120 } }
						alt={ pattern.title }
						aria-labelledby=""
					/>
				</div>
			</button>
		</div>
	);
}
