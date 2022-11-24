import { TERM_ANNUALLY, TERM_MONTHLY } from '@automattic/calypso-products';
import { InspectorControls } from '@wordpress/block-editor';
import { BlockEditProps } from '@wordpress/blocks';
import { SelectControl, PanelRow, PanelBody, RadioControl } from '@wordpress/components';
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
	const planTypeOptions = usePlanOptions( plans );
	const currentPlan = plans?.find( ( plan ) => plan.productSlug === attributes.productSlug );

	const setPlan = ( type: string, term: string ) => {
		const plan = plans?.find( ( plan ) => plan.type === type && plan.term === term );
		setAttributes( { productSlug: plan?.productSlug } );
	};

	const onPlanTypeChange = ( newPlanType: string ) => {
		setPlan( newPlanType, currentPlan?.term ?? plans[ 0 ].term );
	};

	const onPlanTermChange = ( newPlanTerm: string ) => {
		setPlan( currentPlan?.type ?? plans[ 0 ].type, newPlanTerm );
	};

	return (
		<InspectorControls>
			<PanelBody
				className="hb-pricing-plans-embed__settings"
				title={ __( 'Basic', 'happy-blocks' ) }
				initialOpen={ true }
			>
				<PanelRow>
					<SelectControl
						label={ __( 'Plan', 'happy-blocks' ) }
						value={ currentPlan?.type }
						options={ planTypeOptions }
						onChange={ onPlanTypeChange }
					/>
				</PanelRow>
				<PanelRow>
					<RadioControl
						label={ __( 'Price', 'happy-blocks' ) }
						selected={ currentPlan?.term }
						options={ [
							{ label: __( 'Monthly', 'happy-blocks' ), value: TERM_MONTHLY },
							{ label: __( 'Annually', 'happy-blocks' ), value: TERM_ANNUALLY },
						] }
						onChange={ onPlanTermChange }
					/>
				</PanelRow>
			</PanelBody>
		</InspectorControls>
	);
};

export default BlockSettings;
