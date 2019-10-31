/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable wpcalypso/import-docblock */
/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

const CreditTextRenderer = ( { label } ) => <span>{ label }</span>;
const CreditIconRenderer = props => <Icon { ...props } />;

// @TODO: Figure out i18n.

/**
 * @typedef CreditOption
 * @type {Object}
 * @property {string} label         The text to show the user as an option.
 * @property {string} value         The shorthand value to identify the option.
 * @property {string} [renderType]  The type of render to use. Defaults to 'text',
 *                                  which renders the label inside a <span/>. You
 *                                  can also use 'icon' to render an icon from
 *                                  @wordpress/components.
 * @property {Object} [renderProps] The props to pass into the renderer. For example,
 *                                  for an icon, you could specify { icon: 'wordpress', color: 'gray' }
 *                                  which get passed into <Icon /> as props in order to
 *                                  render a gray WordPress icon. You can also specify
 *                                  { label } here in order to override the text you show
 *                                  to users as an option for text types.
 */

/**
 * Filter the Footer Credit options from which the user can choose.
 *
 * Defaults to a WordPress icon and a WordPress.org shout out.
 *
 * @param Array<CreditOption> The array of options to show the user.
 */
export const creditOptions = applyFilters( 'a8c_fse_update_footer_credit_options', [
	{ label: __( 'Proudly powered by WordPress' ), value: 'default', renderType: 'text' },
	{
		label: __( 'WordPress Icon' ),
		value: 'svg',
		renderType: 'icon',
		renderProps: { icon: 'wordpress', color: 'gray' },
	},
] );

export const RenderedCreditChoice = ( { choice } ) => {
	const selection = creditOptions.find( ( { value } ) => value === choice );
	if ( selection ) {
		const { renderType, renderProps, label } = selection;
		const renderer = renderType === 'icon' ? CreditIconRenderer : CreditTextRenderer;
		return renderer( { label, ...renderProps } );
	}
	return null;
};
