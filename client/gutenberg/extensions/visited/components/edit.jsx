/** @format */
/**
 * External dependencies
 */
import { memoize } from 'lodash';
import { Notice, PanelBody, RadioControl, TextControl } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { InnerBlocks, InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { CRITERIA_AFTER, CRITERIA_BEFORE } from '../constants';

const getRadioOptions = memoize( threshold => [
	{ label: sprintf( __( 'Show after %d views', threshold ) ), value: CRITERIA_AFTER },
	{ label: sprintf( __( 'Show before %d views', threshold ) ), value: CRITERIA_BEFORE },
] );

export default class VisitedEdit extends Component {
	setCriteria = criteria => this.props.setAttributes( { criteria } );
	setThreshold = threshold => {
		threshold.length &&
			Number.isFinite( +threshold ) &&
			+threshold > 0 &&
			this.props.setAttributes( { threshold } );
	};

	renderInspectorControls() {
		return (
			<InspectorControls>
				<PanelBody title={ __( 'Visibility settings' ) }>
					<RadioControl
						label={ __( 'Criteria' ) }
						onChange={ this.setCriteria }
						options={ getRadioOptions( this.props.attributes.threshold ) }
						selected={ this.props.attributes.criteria }
					/>
					<TextControl
						label={ __( 'Visit count threshold' ) }
						onChange={ this.setThreshold }
						type="number"
						min="1"
						defaultValue={ this.props.attributes.threshold }
					/>
				</PanelBody>
			</InspectorControls>
		);
	}

	render() {
		return (
			<Fragment>
				{ this.renderInspectorControls() }

				<div className={ this.props.className }>
					<div className="wp-block-jetpack-visited-inner-block">
						<InnerBlocks />
						<Notice status="warning" isDismissible={ false }>
							{ this.props.attributes.criteria === CRITERIA_AFTER
								? sprintf(
										__(
											'This block will only appear to people who have previously visited this page at least %d times.'
										),
										this.props.attributes.threshold
								  )
								: '' }
							{ this.props.attributes.criteria === CRITERIA_BEFORE
								? sprintf(
										__(
											'This block will only appear to people who have visited the page less than %d times'
										),
										this.props.attributes.threshold
								  )
								: '' }
						</Notice>
					</div>
				</div>
			</Fragment>
		);
	}
}
