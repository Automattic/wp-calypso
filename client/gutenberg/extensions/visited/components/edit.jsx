/** @format */
/**
 * External dependencies
 */
import { Notice, PanelBody, RadioControl, TextControl } from '@wordpress/components';
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

class VisitedEdit extends Component {
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
					<div className="wp-block-jetpack-visited-inner-block">
						{ this.props.isSelected && (
							<Notice status="info" isDismissible={ false }>
								{ interpolateComponents( {
									mixedString: __(
										'This block will only appear to people who have previously visited this page {{select /}} {{input/}} times.'
									),
									components: {
										input: (
											<TextControl
												onChange={ this.setThreshold }
												type="number"
												min="1"
												defaultValue={ this.props.attributes.threshold }
											/>
										),
										select: (
											<select>
												<option value={ this.props.attributes.criteria }>at least</option>
												<option value={ this.props.attributes.criteria }>less than</option>
											</select>
										),
									},
								} ) }
							</Notice>
						) }
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
} )( VisitedEdit );
