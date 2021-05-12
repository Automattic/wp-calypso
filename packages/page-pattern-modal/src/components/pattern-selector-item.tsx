/**
 * External dependencies
 */
import { MShotsImage } from '@automattic/design-picker';

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

	const designsEndpoint = 'https://public-api.wordpress.com/rest/v1/template/demo/';
	const sourceSiteUrl = 'dotcompatterns.wordpress.com';

	const previewUrl = `${ designsEndpoint }${ encodeURIComponent( theme ) }/${ encodeURIComponent(
		sourceSiteUrl
	) }/?post_id=${ encodeURIComponent( patternPostID ?? '' ) }&language=${ encodeURIComponent(
		locale
	) }`;

	const mShotsOptions = {
		vpw: 1024,
		vph: 1024,
		w: 660,
		screen_height: 3600,
	};

	const innerPreview = (
		<MShotsImage
			url={ previewUrl }
			aria-label={ title }
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
			{ description }
		</button>
	);
};

export default PatternSelectorItem;
