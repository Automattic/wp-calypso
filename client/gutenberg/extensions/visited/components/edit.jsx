/** @format */
/**
 * External dependencies
 */
import { memoize } from 'lodash';
import { Notice, RadioControl, TextControl } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { InnerBlocks } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { sprintf } from '@wordpress/i18n';
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { CRITERIA_AFTER, CRITERIA_BEFORE } from '../constants';

const getRadioOptions = memoize( threshold => [
	{ label: sprintf( 'Show after %d views', threshold ), value: CRITERIA_AFTER },
	{ label: sprintf( 'Show before %d views', threshold ), value: CRITERIA_BEFORE },
] );

export default class VisitedEdit extends Component {
	setCriteria = criteria => this.props.setAttributes( { criteria } );
	setThreshold = threshold => {
		threshold.length &&
			Number.isFinite( +threshold ) &&
			+threshold > 0 &&
			this.props.setAttributes( { threshold } );
	};

	renderControls() {
		return (
			<Fragment>
				<RadioControl
					label={ __( 'Visibility' ) }
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
			</Fragment>
		);
	}

	render() {
		return (
			<Fragment>
				<div className={ this.props.className }>
					{ this.renderControls() }
					<div className="wp-block-jetpack-visited-inner-block">
						<InnerBlocks />
						<Notice status="warning" isDismissible={ false }>
							{ this.props.attributes.criteria === CRITERIA_AFTER
								? sprintf(
										'This block will only appear to people who have previously visited this page at least %d times.',
										this.props.attributes.threshold
								  )
								: '' }
							{ this.props.attributes.criteria === CRITERIA_BEFORE
								? sprintf(
										'This block will only appear to people who have visited the page less than %d times',
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
