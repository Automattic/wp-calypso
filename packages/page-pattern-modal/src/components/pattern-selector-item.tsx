import { MShotsImage } from '@automattic/onboarding';

interface PatternSelectorItemProps {
	description?: string;
	locale: string;
	onSelect: ( value: string ) => void;
	patternPostID: number | null;
	title?: string;
	stylesheet: string;
	value?: string;
}

const PATTERN_PREVIEW_ENDPOINT = 'https://public-api.wordpress.com/wpcom/v2/block-previews/pattern';

const PATTERN_SOURCE_SITE = 'dotcompatterns.wordpress.com';

const getPatternPreviewUrl = (
	stylesheet: string,
	language: string,
	patternId: string
): string => {
	const params = new URLSearchParams( {
		demo_site: window._currentSiteId.toString(),
		stylesheet,
		source_site: PATTERN_SOURCE_SITE,
		pattern_id: patternId,
		language,
	} );

	return `${ PATTERN_PREVIEW_ENDPOINT }?${ params }`;
};

const PatternSelectorItem = ( props: PatternSelectorItemProps ) => {
	const { value, onSelect, title, description, stylesheet, locale, patternPostID } = props;

	if ( title == null || value == null ) {
		return null;
	}

	const previewUrl = getPatternPreviewUrl( stylesheet, locale, String( patternPostID ) );

	const mShotsOptions = {
		vpw: 1024,
		vph: 1024,
		w: 660,
		screen_height: 3600,
	};

	const descriptionClass = `pattern-selector-item__preview-label__${ value }`;

	const innerPreview = (
		<MShotsImage
			url={ previewUrl }
			aria-labelledby={ descriptionClass }
			alt={ title }
			options={ mShotsOptions }
			scrollable={ true }
		/>
	);

	return (
		<button
			type="button"
			className="pattern-selector-item__label"
			value={ value }
			onClick={ () => onSelect( value ) }
		>
			<span className="pattern-selector-item__preview-wrap">
				<div className="pattern-selector-item__preview-wrap-inner-position">{ innerPreview }</div>
			</span>
			<div id={ descriptionClass }>{ description }</div>
		</button>
	);
};

export default PatternSelectorItem;
