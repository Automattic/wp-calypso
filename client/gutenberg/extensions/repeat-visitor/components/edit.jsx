/** @format */
/**
 * External dependencies
 */
import { Notice, TextControl, SelectControl } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { InnerBlocks } from '@wordpress/editor';
import { withSelect } from '@wordpress/data';
import interpolateComponents from 'interpolate-components';

/**
 * Internal dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { CRITERIA_AFTER, CRITERIA_BEFORE } from '../constants';

const SELECT_OPTIONS = [
	{ value: CRITERIA_AFTER, label: __( 'at least' ) },
	{ value: CRITERIA_BEFORE, label: __( 'less than' ) },
];

class RepeatVisitorEdit extends Component {
	setCriteria = criteria => this.props.setAttributes( { criteria } );
	setThreshold = threshold => {
		threshold.length &&
			Number.isFinite( +threshold ) &&
			+threshold > 0 &&
			this.props.setAttributes( { threshold } );
	};

	render() {
		return (
			<Fragment>
				<div className={ this.props.className }>
					<div className="wp-block-jetpack-repeat-visitor-inner-block">
						{
							<Notice status="info" isDismissible={ false }>
								{ this.props.isSelected
									? interpolateComponents( {
											mixedString: __(
												'This block will only appear to people who have previously visited this page {{atLeastOrLessThanSelectBox/}} {{numberInputField/}} times.'
											),
											components: {
												numberInputField: (
													<TextControl
														defaultValue={ this.props.attributes.threshold }
														min="1"
														onChange={ this.setThreshold }
														type="number"
													/>
												),
												atLeastOrLessThanSelectBox: (
													<SelectControl
														value={ this.props.attributes.criteria }
														onChange={ this.setCriteria }
														options={ SELECT_OPTIONS }
													/>
												),
											},
									  } )
									: sprintf(
											__(
												'This block will only appear to people who have previously visited this page %s %d times.'
											),
											this.props.attributes.criteria === CRITERIA_AFTER
												? SELECT_OPTIONS[ 0 ].label
												: SELECT_OPTIONS[ 1 ].label,
											this.props.attributes.threshold
									  ) }
							</Notice>
						}
						<InnerBlocks />
					</div>
				</div>
			</Fragment>
		);
	}
}

export default withSelect( ( select, ownProps ) => {
	const { isBlockSelected, hasSelectedInnerBlock } = select( 'core/editor' );
	return {
		isSelected: isBlockSelected( ownProps.clientId ) || hasSelectedInnerBlock( ownProps.clientId ),
	};
} )( RepeatVisitorEdit );
