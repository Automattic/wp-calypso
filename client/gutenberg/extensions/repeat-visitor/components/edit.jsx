/** @format */
/**
 * External dependencies
 */
import { Notice, TextControl, RadioControl, Placeholder } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { InnerBlocks } from '@wordpress/editor';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { CRITERIA_AFTER, CRITERIA_BEFORE } from '../constants';
import { icon } from '../index';

const RADIO_OPTIONS = [
	{ value: CRITERIA_AFTER, label: __( 'Show after threshold' ), noticeLabel: __( 'at least' ) },
	{ value: CRITERIA_BEFORE, label: __( 'Show before threshold' ), noticeLabel: __( 'less than' ) },
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
						{ this.props.isSelected && (
							<Placeholder
								icon={ icon }
								label={ __( 'Repeat Visitor' ) }
								className="wp-block-jetpack-repeat-visitor-placeholder"
							>
								<TextControl
									className="wp-block-jetpack-repeat-visitor-threshold"
									label={ __( 'Visit count threshold' ) }
									defaultValue={ this.props.attributes.threshold }
									min="1"
									onChange={ this.setThreshold }
									type="number"
								/>

								<RadioControl
									label={ __( 'Visibility' ) }
									selected={ this.props.attributes.criteria }
									options={ RADIO_OPTIONS }
									onChange={ this.setCriteria }
								/>
							</Placeholder>
						) }
						<Notice status="info" isDismissible={ false }>
							{ sprintf(
								__(
									'This block will only appear to people who have previously visited this page %s %d times.'
								),
								this.props.attributes.criteria === CRITERIA_AFTER
									? RADIO_OPTIONS[ 0 ].noticeLabel
									: RADIO_OPTIONS[ 1 ].noticeLabel,
								this.props.attributes.threshold
							) }
						</Notice>
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
