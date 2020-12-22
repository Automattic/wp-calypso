/**
 * External dependencies
 */
import { isNil } from 'lodash';
import classnames from 'classnames';

const TemplateSelectorItem = ( props ) => {
	const {
		id,
		value,
		onSelect,
		title,
		description,
		theme,
		locale,
		templatePostID = null,
		isSelected,
	} = props;

	if ( isNil( id ) || isNil( title ) || isNil( value ) ) {
		return null;
	}

	const mshotsUrl = 'https://s0.wordpress.com/mshots/v1/';
	const designsEndpoint = 'https://public-api.wordpress.com/rest/v1/template/demo/';
	const sourceSiteUrl = 'dotcompatterns.wordpress.com';

	const previewUrl = `${ designsEndpoint }${ encodeURIComponent( theme ) }/${ encodeURIComponent(
		sourceSiteUrl
	) }/?post_id=${ encodeURIComponent( templatePostID ) }&language=${ encodeURIComponent(
		locale
	) }`;

	const staticPreviewImg =
		'blank' === value
			? null
			: mshotsUrl + encodeURIComponent( previewUrl ) + '?vpw=1024&vph=1024&w=500&h=500';

	const refreshSourceImg = ( e ) => {
		const img = e.target;

		if ( -1 !== img.src.indexOf( 'reload=1' ) ) {
			return;
		}

		setTimeout( () => {
			img.src = img.src + '&reload=1';
		}, 3000 );
	};

	const innerPreview =
		'blank' === value ? null : (
			<img
				className="template-selector-item__media"
				src={ staticPreviewImg }
				alt={ title }
				onLoad={ refreshSourceImg }
			/>
		);

	const handleClick = () => {
		onSelect( value );
	};

	return (
		<button
			type="button"
			className={ classnames( 'template-selector-item__label', {
				'is-selected': isSelected,
			} ) }
			value={ value }
			onClick={ handleClick }
			aria-label={ description }
		>
			<span className="template-selector-item__preview-wrap">{ innerPreview }</span>
		</button>
	);
};

export default TemplateSelectorItem;
