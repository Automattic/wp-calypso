/* eslint-disable wpcalypso/jsx-classname-namespace */
import './styles.scss';
import { MShotsImage } from '@automattic/onboarding';
import cx from 'classnames';
import { PATTERN_SOURCE_SITE_SLUG } from './constants';
import type { Pattern, PatternMeta } from './types';

type Props = {
	className?: string;
	style?: React.CSSProperties;
	onClick: () => void;
	pattern: Pattern;
};

type ParsedMetaData = {
	site_title?: string;
	site_tagline?: string;
	site_logo_url?: string;
};

const parsePatternMetaData = ( patternMeta: PatternMeta ): ParsedMetaData => {
	const result: ParsedMetaData = {};

	const getPatternMetaValue = ( patternMetaKey: string, regexp: RegExp ) => {
		const [ , value ] = patternMetaKey.split( regexp );
		if ( value ) {
			// We have to unescape `,` because the pattern meta is separated with commas and we store the escaped value
			return value.replace( /%2C/g, ',' );
		}

		return null;
	};

	Object.keys( patternMeta ).forEach( ( patternMetaKey ) => {
		const siteTitle = getPatternMetaValue( patternMetaKey, /^site_title_/ );
		const siteTagline = getPatternMetaValue( patternMetaKey, /^site_tagline_/ );
		const siteLogoUrl = getPatternMetaValue( patternMetaKey, /^site_logo_url_/ );

		if ( siteTitle ) {
			result.site_title = siteTitle;
		}

		if ( siteTagline ) {
			result.site_tagline = siteTagline;
		}

		if ( siteLogoUrl ) {
			result.site_logo_url = siteLogoUrl;
		}
	} );

	return result;
};

const getPatternPreviewUrl = ( pattern: Pattern ): string => {
	const params = new URLSearchParams( {
		stylesheet: 'pub/lynx',
		source_site: PATTERN_SOURCE_SITE_SLUG,
		pattern_id: [ pattern.ID, pattern.site_id ].join( '-' ),
		...parsePatternMetaData( pattern.pattern_meta ),
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
						options={ { w: 400, vpw: 400, vph: 872, format: 'png' } }
						alt={ pattern.title }
						aria-labelledby=""
					/>
				</div>
			</button>
		</div>
	);
}
