/**
 * External dependencies
 */
import classnames from 'classnames';
import { omit, pick } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	RichText,
	getColorClass,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';
import edit from './edit';

const blockAttributes = {
	url: {
		type: 'string',
		source: 'attribute',
		selector: 'a',
		attribute: 'href',
	},
	title: {
		type: 'string',
		source: 'attribute',
		selector: 'a',
		attribute: 'title',
	},
	text: {
		type: 'array',
		source: 'children',
		selector: 'a',
	},
	align: {
		type: 'string',
		default: 'none',
	},
	backgroundColor: {
		type: 'string',
	},
	textColor: {
		type: 'string',
	},
	customBackgroundColor: {
		type: 'string',
	},
	customTextColor: {
		type: 'string',
	},
};

export const name = 'core/button';

const colorsMigration = ( attributes ) => {
	return omit( {
		...attributes,
		customTextColor: attributes.textColor && '#' === attributes.textColor[ 0 ] ? attributes.textColor : undefined,
		customBackgroundColor: attributes.color && '#' === attributes.color[ 0 ] ? attributes.color : undefined,
	}, [ 'color', 'textColor' ] );
};

export const settings = {
	title: __( 'Button' ),

	description: __( 'Want visitors to click to subscribe, buy, or read more? Get their attention with a button.' ),

	icon: 'button',

	category: 'layout',

	attributes: blockAttributes,

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		const props = { 'data-resized': true };

		if ( 'left' === align || 'right' === align || 'center' === align ) {
			props[ 'data-align' ] = align;
		}

		return props;
	},

	styles: [
		{ name: 'default', label: __( 'Rounded' ), isDefault: true },
		{ name: 'outline', label: __( 'Outline' ) },
		{ name: 'squared', label: __( 'Squared' ) },
	],

	edit,

	save( { attributes } ) {
		const {
			url,
			text,
			title,
			align,
			backgroundColor,
			textColor,
			customBackgroundColor,
			customTextColor,
		} = attributes;

		const textClass = getColorClass( 'color', textColor );
		const backgroundClass = getColorClass( 'background-color', backgroundColor );

		const buttonClasses = classnames( 'wp-block-button__link', {
			'has-text-color': textColor || customTextColor,
			[ textClass ]: textClass,
			'has-background': backgroundColor || customBackgroundColor,
			[ backgroundClass ]: backgroundClass,
		} );

		const buttonStyle = {
			backgroundColor: backgroundClass ? undefined : customBackgroundColor,
			color: textClass ? undefined : customTextColor,
		};

		return (
			<div className={ `align${ align }` }>
				<RichText.Content
					tagName="a"
					className={ buttonClasses }
					href={ url }
					title={ title }
					style={ buttonStyle }
					value={ text }
				/>
			</div>
		);
	},

	deprecated: [ {
		attributes: {
			...pick( blockAttributes, [ 'url', 'title', 'text', 'align' ] ),
			color: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
		},

		save( { attributes } ) {
			const { url, text, title, align, color, textColor } = attributes;

			const buttonStyle = {
				backgroundColor: color,
				color: textColor,
			};

			const linkClass = 'wp-block-button__link';

			return (
				<div className={ `align${ align }` }>
					<RichText.Content
						tagName="a"
						className={ linkClass }
						href={ url }
						title={ title }
						style={ buttonStyle }
						value={ text }
					/>
				</div>
			);
		},
		migrate: colorsMigration,
	},
	{
		attributes: {
			...pick( blockAttributes, [ 'url', 'title', 'text', 'align' ] ),
			color: {
				type: 'string',
			},
			textColor: {
				type: 'string',
			},
		},

		save( { attributes } ) {
			const { url, text, title, align, color, textColor } = attributes;

			return (
				<div className={ `align${ align }` } style={ { backgroundColor: color } }>
					<RichText.Content
						tagName="a"
						href={ url }
						title={ title }
						style={ { color: textColor } }
						value={ text }
					/>
				</div>
			);
		},
		migrate: colorsMigration,
	},
	],
};
