/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var ThemeThumbnail = require( './theme-thumbnail' ),
	StepWrapper = require( 'signup/step-wrapper' );

module.exports = React.createClass( {
	displayName: 'ThemeSelection',

	getDefaultProps: function() {
		return {
			themes: [
				'Boardwalk',
				'Cubic',
				'Edin',
				'Cols',
				'Minnow',
				'Sequential',
				'Penscratch',
				'Intergalactic',
				'Eighties'
			],

			useHeadstart: false
		};
	},

	renderThemes: function() {
		return (
			<div>
				{ this.props.themes.map( function( theme ) {
					return <ThemeThumbnail
						key={ theme }
						theme={ theme }
						{ ...this.props }/>;
				}.bind( this ) ) }
			</div>
		);
	},

	render: function() {
		const defaultDependencies = this.props.useHeadstart ? { theme: 'pub/twentyfifteen', images: null } : undefined;

		return (
			<StepWrapper
				fallbackHeaderText={ this.translate( 'Choose a theme.' ) }
				fallbackSubHeaderText={ this.translate( 'No need to overthink it. You can always switch to a different theme\u00a0later.' ) }
				subHeaderText={ this.translate( 'Choose a theme. You can always switch to a different theme\u00a0later.' ) }
				stepContent={ this.renderThemes() }
				defaultDependencies={ defaultDependencies }
				{ ...this.props } />
		);
	}
} );
