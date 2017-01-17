/* eslint-disable max-len */

/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Accordion = require( 'components/accordion' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'AccordionExample',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			showSubtitles: true
		};
	},

	_toggleShowSubtitles: function() {
		this.setState( {
			showSubtitles: ! this.state.showSubtitles
		} );
	},

	render: function() {
		return (
			<div>
				<div style={ { paddingBottom: '10px' } }>
					<label>
						<input
							type="checkbox"
							checked={ this.state.showSubtitles }
							onChange={ this._toggleShowSubtitles }
						/>
						<span>Show subtitles</span>
					</label>
				</div>

				<div style={ { maxWidth: '300px' } }>
					<Accordion title="Section One">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris fermentum eget libero at pretium. Morbi hendrerit arcu mauris, laoreet dapibus est maximus nec. Sed volutpat, lorem semper porta efficitur, dui augue tempor ante, eget faucibus quam erat vitae velit.
					</Accordion>
					<Accordion title="Section Two" icon={ <Gridicon icon="time" /> }>
						In tempor orci sapien, non tempor risus suscipit ut. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris vitae volutpat nunc. Nunc at congue arcu. Proin non leo augue. Nulla dapibus laoreet ligula, nec varius sit amet.
					</Accordion>
					<Accordion
						title="Section Three"
						subtitle={ this.state.showSubtitles ? 'With Subtitle' : null }>
						Suspendisse pellentesque diam in nisi pulvinar maximus. Integer feugiat feugiat justo ac vehicula. Curabitur iaculis, risus suscipit sodales auctor, nisl urna elementum sem, non vestibulum mauris ante et purus. Duis iaculis nisl neque, eget rutrum erat imperdiet non.
					</Accordion>
					<Accordion
						title="Section Four"
						subtitle={ this.state.showSubtitles ? 'With a Very Long Subtitle to Demonstrate the Fade Effect' : null }>
						Drumstick ham tongue flank doner pork chop picanha. Cow short ribs tail kevin capicola ball tip. Leberkas shankle landjaeger tenderloin, chuck cupim pastrami cow frankfurter. Kielbasa bacon capicola shoulder porchetta, frankfurter rump short loin pig cupim.
					</Accordion>
					<Accordion
						title="Section Five"
						subtitle={ this.state.showSubtitles ? 'With Subtitle and Icon' : null }
						icon={ <Gridicon icon="time" /> }>
						Etiam dictum odio elit, id faucibus urna elementum ac. Mauris in est nec tortor luctus auctor ut a velit. Suspendisse vulputate lectus arcu, sed condimentum risus rutrum vitae. Nullam sagittis ultricies nisl. Duis accumsan libero vel arcu sodales venenatis.
					</Accordion>
					<Accordion
						title="Section Six"
						subtitle={ this.state.showSubtitles ? 'With Subtitle and Status' : null }
						status={ {
							type: 'warning',
							text: 'Warning!',
							url: '/devdocs/design'
						} }>
						Suspendisse pellentesque diam in nisi pulvinar maximus. Integer feugiat feugiat justo ac vehicula. Curabitur iaculis, risus suscipit sodales auctor, nisl urna elementum sem, non vestibulum mauris ante et purus. Duis iaculis nisl neque, eget rutrum erat imperdiet non.
					</Accordion>
				</div>
			</div>
		);
	}
} );
