/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { MShotsImage } from '@automattic/onboarding';
import cx from 'classnames';
import { PATTERN_SOURCE_SITE_SLUG } from './constants';
import { Pattern } from './types';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	onClick: () => void;
	pattern: Pattern;
};

const getPatternMetaValue = ( patternMeta: string, regexp: RegExp ) => {
	const [ , value ] = patternMeta.split( regexp );
	if ( value ) {
		return value.replace( /%2C/g, ',' );
	}

	return null;
};

const getPatternPreviewUrl = ( pattern: Pattern ): string => {
	const params = new URLSearchParams( {
		stylesheet: 'pub/lynx',
		source_site: PATTERN_SOURCE_SITE_SLUG,
		pattern_id: [ pattern.ID, pattern.site_id ].join( '-' ),
	} );

	Object.keys( pattern.pattern_meta ).forEach( ( patternMeta ) => {
		const siteTitle = getPatternMetaValue( patternMeta, /^site_title_/ );
		const siteTagline = getPatternMetaValue( patternMeta, /^site_tagline_/ );
		const siteLogoUrl = getPatternMetaValue( patternMeta, /^site_logo_url_/ );

		if ( siteTitle ) {
			params.set( 'site_title', siteTitle );
		}

		if ( siteTagline ) {
			params.set( 'site_tagline', siteTagline );
		}

		if ( siteLogoUrl ) {
			params.set( 'site_logo_url', siteLogoUrl );
		}
	} );

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
