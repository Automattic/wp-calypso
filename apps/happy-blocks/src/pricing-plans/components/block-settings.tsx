import { InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { SelectControl, PanelRow, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import usePlanOptions from '../hooks/plan-options';
import { BlockPlan } from '../hooks/pricing-plans';
import { BlockAttributes } from '../types';

interface Props {
	plans: BlockPlan[];
}

const BlockSettings: FunctionComponent<
	Pick< BlockEditProps< BlockAttributes >, 'attributes' | 'setAttributes' > & Props
> = ( { attributes, setAttributes, plans } ) => {
	const options = usePlanOptions( plans );

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Basic', 'happy-blocks' ) } initialOpen={ true }>
				<PanelRow>
					<SelectControl
						className="hb-pricing-plans-embed__settings-plan"
						label={ __( 'Plan', 'happy-blocks' ) }
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
