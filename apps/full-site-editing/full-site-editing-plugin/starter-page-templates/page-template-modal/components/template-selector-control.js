/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withInstanceId } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';

function TemplateSelectorControl( {
	label,
	className,
	useBlank,
	help,
	instanceId,
	onClick,
	templates = [],
} ) {
	const id = `inspector-radio-control-${ instanceId }`;
	const handleButtonClick = event => onClick( event.target.value );

	if ( isEmpty( templates ) ) {
		return null;
	}

	if ( useBlank ) {
		templates.unshift( {
			label: 'Blank',
			preview: 'https://via.placeholder.com/200x180',
			value: '',
		} );
	}

	return (
		<BaseControl
			label={ label }
			id={ id }
			help={ help }
			className={ classnames( className, 'template-selector-control' ) }
		>
			{ templates.map( ( option, index ) => {
				const buttonClass = classnames( 'template-selector-control__label', {
					'is-blank': option.value === '',
				} );

				return (
					<div key={ `${ id }-${ index }` } className="template-selector-control__option">
						<button
							type="button"
							id={ `${ id }-${ index }` }
							className={ buttonClass }
							value={ option.value }
							onClick={ handleButtonClick }
							aria-describedby={ help ? `${ id }__help` : undefined }
						>
							<img className="template-selector-control__media" src={ option.preview } alt="" />
							{ option.label }
						</button>
					</div>
				);
			} ) }
		</BaseControl>
	);
}

export default withInstanceId( TemplateSelectorControl );
