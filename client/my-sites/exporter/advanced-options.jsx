/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Button from 'components/forms/form-button';
import OptionFieldset from 'my-sites/exporter/option-fieldset';

/**
 * Displays additional options for customising an export
 *
 * Allows the user to select whether Pages, Posts and Feedback are
 * exported. Posts and Pages can also be filtered by Authors, Statuses,
 * and Date.
 */
export default React.createClass( {
	displayName: 'AdvancedOptions',

	propTypes: {
		// Event handlers
		onToggleFieldset: PropTypes.func.isRequired,

		// Data
		posts: PropTypes.shape( {
			isEnabled: PropTypes.bool.isRequired
		} ),
		pages: PropTypes.shape( {
			isEnabled: PropTypes.bool.isRequired
		} ),
		feedback: PropTypes.shape( {
			isEnabled: PropTypes.bool.isRequired
		} )
	},

	render() {
		const legends = {
			posts: this.translate( 'Posts' ),
			pages: this.translate( 'Pages' ),
			feedback: this.translate( 'Feedback' )
		};

		const menus = {
			posts: [
				{ value: 0, options: [ this.translate( 'All Authors' ) ] },
				{ value: 0, options: [ this.translate( 'All Statuses' ) ] },
				{ value: 0, options: [ this.translate( 'Starting Date...' ) ] },
				{ value: 0, options: [ this.translate( 'Ending Date...' ) ] },
				{ value: 0, options: [ this.translate( 'All Categories' ) ] }
			],
			pages: [
				{ value: 0, options: [ this.translate( 'All Authors' ) ] },
				{ value: 0, options: [ this.translate( 'All Statuses' ) ] },
				{ value: 0, options: [ this.translate( 'Starting Date...' ) ] },
				{ value: 0, options: [ this.translate( 'Ending Date...' ) ] }
			],
			feedback: []
		};

		const buildOptionProps = key => ( {
			legend: legends[ key ],
			isEnabled: this.props[ key ].isEnabled,
			menus: menus[ key ],
			onToggleEnabled: () => this.props.onToggleFieldset( key )
		} );

		return (
			<CompactCard className="exporter__more-info">
				<h1 className="exporter__advanced-options-title">
					{ this.translate( 'Select Content to Export' ) }
				</h1>
				<p>
					{ this.translate(
						'Use the options below to select specific content ' +
						'types to download. You can deselect Posts, Pages, ' +
						'and Feedback, or filter each by the listed parameters. ' +
						'After making your selection you can download your ' +
						'content in an .xml file.' ) }
				</p>
				<div className="exporter__advanced-options-row">
					<OptionFieldset { ...buildOptionProps( 'posts' ) } />
					<OptionFieldset { ...buildOptionProps( 'pages' ) } />
					<OptionFieldset { ...buildOptionProps( 'feedback' ) }
						description={ this.translate( 'Survey results etc.' ) }
					/>
				</div>
				<Button isPrimary={ true }>
					{ this.translate( 'Export Selected Content' ) }
				</Button>
			</CompactCard>
		);
	}
} );
