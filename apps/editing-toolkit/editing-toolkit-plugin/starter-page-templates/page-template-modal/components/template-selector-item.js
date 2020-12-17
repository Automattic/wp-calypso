/**
 * External dependencies
 */
import { isNil, isEmpty } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import BlockIframePreview from './block-iframe-preview';

const TemplateSelectorItem = ( props ) => {
	const {
		id,
		value,
		onSelect,
		title,
		description,
		useDynamicPreview = false,
		staticPreviewImgAlt = '',
		blocks = [],
		isSelected,
	} = props;

	if ( isNil( id ) || isNil( title ) || isNil( value ) ) {
		return null;
	}

	if ( useDynamicPreview && ( isNil( blocks ) || isEmpty( blocks ) ) ) {
		return null;
	}

	const staticPreviewImg =
		'blank' === value
			? null
			: 'https://s0.wordpress.com/mshots/v1/' +
			  encodeURI( 'https://dotcompatterns.wordpress.com/' + value ) +
			  '?vpw=1024&vph=1024&w=270&h=270';

	// Define static or dynamic preview.
	const innerPreview = useDynamicPreview ? (
		<BlockIframePreview blocks={ blocks } viewportWidth={ 960 } />
	) : (
		<img
			className="template-selector-item__media"
			src={ staticPreviewImg }
			alt={ staticPreviewImgAlt }
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
