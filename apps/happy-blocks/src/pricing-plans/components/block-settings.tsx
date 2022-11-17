import { InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { SelectControl, PanelRow, PanelBody } from '@wordpress/components';
import { FunctionComponent } from 'react';
import { BlockAttributes, PricingPlan, PricingPlansConfiguration } from '../types';

interface Props {
	plans: PricingPlansConfiguration;
}

function getLastElementOrNull< T >( array: T[] ): T | null {
	if ( ! Array.isArray( array ) || array.length === 0 ) {
		return null;
	}
	return array[ array.length - 1 ];
}

function getPlanGroupFromPlanSlug( planSlug: string ): string {
	return planSlug.replace( '-monthly', '' ).replace( '-yearly', '' );
}

const BlockSettings: FunctionComponent<
	Pick< BlockEditProps< BlockAttributes >, 'attributes' | 'setAttributes' > & Props
> = ( { attributes, setAttributes, plans } ) => {
	const options = Object.values( plans ).map( ( plan: PricingPlan ) => ( {
		value: getLastElementOrNull( plan.billing )?.planSlug ?? '',
		label: plan.label,
	} ) );

	const value = getPlanGroupFromPlanSlug( attributes.planSlug );

	return (
		<InspectorControls>
			<PanelBody title="Basic" initialOpen={ true }>
				<PanelRow>
					<SelectControl
						className="wp-block-a8c-pricing-plans__settings-plan"
						label="Plan"
						value={ value }
						options={ options }
						onChange={ ( planSlug ) => setAttributes( { planSlug } ) }
					/>
				</PanelRow>
			</PanelBody>
		</InspectorControls>
	);
};

export default BlockSettings;
