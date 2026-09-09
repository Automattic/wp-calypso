import { CheckboxControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import InlineSupportLink from './inline-support-link';

/**
 * A checkbox whose label ends in a "Learn more" support link.
 *
 * `label` must contain a single `<link></link>` placeholder holding the link text.
 */
export function CheckboxWithSupportLink( {
	label,
	supportContext,
	checked,
	onChange,
	hideLabelFromVision,
}: {
	label: string;
	supportContext: string;
	checked: boolean;
	onChange: ( value: boolean ) => void;
	hideLabelFromVision?: boolean;
} ) {
	return (
		<CheckboxControl
			__nextHasNoMarginBottom
			// @wordpress/components types `label` as a string, but it renders as the
			// content of the <label> element, so a node works at runtime.
			label={
				hideLabelFromVision
					? ''
					: ( createInterpolateElement( label, {
							link: <InlineSupportLink supportContext={ supportContext } />,
					  } ) as unknown as string )
			}
			checked={ checked }
			onChange={ onChange }
		/>
	);
}
