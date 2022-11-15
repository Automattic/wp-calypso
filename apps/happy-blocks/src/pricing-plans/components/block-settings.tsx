import { InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { SelectControl, PanelRow, PanelBody } from '@wordpress/components';
import { FunctionComponent } from 'react';
import { BlockAttributes, PricingPlansConfiguration } from '../types';

interface Props {
	plans: PricingPlansConfiguration;
}

const BlockSettings: FunctionComponent<
	Pick< BlockEditProps< BlockAttributes >, 'attributes' | 'setAttributes' > & Props
> = ( { attributes, setAttributes, plans } ) => {
	const options = Object.values( plans ).map( ( plan ) => ( {
		value: plan.billing.slice( -1 )[ 0 ].planSlug,
		label: plan.label,
	} ) );

	return (
		<InspectorControls>
			<PanelBody title="Basic" initialOpen={ true }>
				<PanelRow>
					<SelectControl
						className="wp-block-a8c-pricing-plans__settings-plan"
						label="Plan"
						value={ attributes.planSlug }
						options={ options }
						onChange={ ( planSlug ) => setAttributes( { planSlug } ) }
					/>
				</PanelRow>
			</PanelBody>
		</InspectorControls>
	);
};

export default BlockSettings;
