/**
 * Callout Icon Block
 *
 * Icon component for callout blocks using Dashicons.
 * Restricted to use only within callout blocks.
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { CALLOUT_TEMPLATE_DEFAULT_COLOR } from '../callout/constants';

const CalloutIconBlock = {
	name: 'a8c/callout-icon',
	settings: {
		title: __( 'Callout Icon' ),
		icon: 'info-outline',
		category: 'a8c',
		parent: [ 'a8c/callout' ],
		supports: {
			html: false,
			className: false,
			reusable: false,
			selectable: false,
		},
		attributes: {
			iconName: {
				type: 'string',
				default: 'dashicons-info-outline',
			},
			iconColor: {
				type: 'string',
				default: CALLOUT_TEMPLATE_DEFAULT_COLOR,
			},
		},
		edit: ( { attributes } ) => {
			const { iconName, iconColor } = attributes;

			return (
				<div className="o2-blocks-callout__icon" style={ { borderColor: iconColor } }>
					<span
						className={ `dashicons ${ iconName }` }
						style={ { color: iconColor } }
						aria-hidden="true"
					/>
				</div>
			);
		},
		save: ( { attributes } ) => {
			const { iconName, iconColor } = attributes;

			return (
				<div className="o2-blocks-callout__icon" style={ { borderColor: iconColor } }>
					<span
						className={ `dashicons ${ iconName }` }
						style={ { color: iconColor } }
						aria-hidden="true"
					/>
				</div>
			);
		},
	},
};

registerBlockType( CalloutIconBlock.name, CalloutIconBlock.settings );
