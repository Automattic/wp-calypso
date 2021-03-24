interface PatternSelectorItemProps {
	description?: string;
	locale: string;
	onSelect: ( value: string ) => void;
	patternPostID: number | null;
	title?: string;
	theme: string;
	value?: string;
}

const PatternSelectorItem = ( props: PatternSelectorItemProps ): JSX.Element | null => {
	const { value, onSelect, title, description, theme, locale, patternPostID } = props;

	if ( title == null || value == null ) {
		return null;
	}

	const mshotsUrl = 'https://s0.wordpress.com/mshots/v1/';
	const designsEndpoint = 'https://public-api.wordpress.com/rest/v1/template/demo/';
	const sourceSiteUrl = 'dotcompatterns.wordpress.com';

	const previewUrl = `${ designsEndpoint }${ encodeURIComponent( theme ) }/${ encodeURIComponent(
		sourceSiteUrl
	) }/?post_id=${ encodeURIComponent( patternPostID ?? '' ) }&language=${ encodeURIComponent(
		locale
	) }`;

	const staticPreviewImg =
		mshotsUrl + encodeURIComponent( previewUrl ) + '?vpw=1024&vph=1024&w=660&h=430';

	const refreshSourceImg = ( e: React.SyntheticEvent< HTMLImageElement > ) => {
		const img = e.currentTarget;

		if ( -1 !== img.src.indexOf( 'reload=1' ) ) {
			return;
		}

		setTimeout( () => {
			img.src = img.src + '&reload=1';
		}, 10000 );
	};

	const innerPreview = (
		<img
			className="pattern-selector-item__media"
			src={ staticPreviewImg }
			alt={ title }
			onLoad={ refreshSourceImg }
		/>
	);

	return (
		<button
			type="button"
			className="pattern-selector-item__label"
			value={ value }
			onClick={ () => onSelect( value ) }
		>
			<span className="pattern-selector-item__preview-wrap">{ innerPreview }</span>
			{ description }
		</button>
	);
};

export default PatternSelectorItem;
