/**
 * /* eslint-disable max-len
 *
 * @format
 */

/**
 * External dependencies
 */
import React from 'react';
import jsxToString from 'jsx-to-string';

/**
 * Internal dependencies
 */
import ComponentPlayground from 'devdocs/design/component-playground';
import Accordion from 'components/accordion';
import Gridicon from 'gridicons';

const scope = { Accordion, Gridicon };

export const accordionCode =
	'<Accordion ' +
	'\n\t\ttitle="Section Seven" ' +
	'\n\t\tsubtitle="With Subtitle, Status and Icon" ' +
	'\n\t\ticon={ <Gridicon icon="time" /> } ' +
	'\n\t\tstatus={ { type: "warning", text: "Warning!", url: "/devdocs/design", }}>' +
	'\n\t\t\tSuspendisse pellentesque diam in nisi pulvinar maximus. Integer feugiat feugiat justo ac ' +
	'\n\t\t\tvehicula. Curabitur iaculis, risus suscipit sodales auctor, nisl urna elementum sem, non ' +
	'\n\t\t\tvestibulum mauris ante et purus. Duis iaculis nisl neque, eget rutrum erat imperdiet ' +
	'\n\t\t\tnon.' +
	'\n\t</Accordion>';

export default class extends React.PureComponent {
	static displayName = 'AccordionExample';

	state = {
		showSubtitles: true,
	};

	_toggleShowSubtitles = () => {
		this.setState( {
			showSubtitles: ! this.state.showSubtitles,
		} );
	};

	exmapleCode() {
		return jsxToString(
			<div>
				<Accordion title="Section One">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris fermentum eget libero at
					pretium. Morbi hendrerit arcu mauris, laoreet dapibus est maximus nec. Sed volutpat, lorem
					semper porta efficitur, dui augue tempor ante, eget faucibus quam erat vitae velit.
				</Accordion>

				<Accordion title="Section Two" icon={ <Gridicon icon="time" /> }>
					In tempor orci sapien, non tempor risus suscipit ut. Class aptent taciti sociosqu ad
					litora torquent per conubia nostra, per inceptos himenaeos. Mauris vitae volutpat nunc.
					Nunc at congue arcu. Proin non leo augue. Nulla dapibus laoreet ligula, nec varius sit
					amet.
				</Accordion>

				<Accordion
					title="Section Three"
					subtitle={ this.state.showSubtitles ? 'With Subtitle' : null }
				>
					Suspendisse pellentesque diam in nisi pulvinar maximus. Integer feugiat feugiat justo ac
					vehicula. Curabitur iaculis, risus suscipit sodales auctor, nisl urna elementum sem, non
					vestibulum mauris ante et purus. Duis iaculis nisl neque, eget rutrum erat imperdiet non.
				</Accordion>

				<Accordion
					title="Section Four"
					subtitle={
						this.state.showSubtitles
							? 'With a Very Long Subtitle to Demonstrate the Fade Effect'
							: null
					}
				>
					Drumstick ham tongue flank doner pork chop picanha. Cow short ribs tail kevin capicola
					ball tip. Leberkas shankle landjaeger tenderloin, chuck cupim pastrami cow frankfurter.
					Kielbasa bacon capicola shoulder porchetta, frankfurter rump short loin pig cupim.
				</Accordion>

				<Accordion
					title="Section Five"
					subtitle={ this.state.showSubtitles ? 'With Subtitle and Icon' : null }
					icon={ <Gridicon icon="time" /> }
				>
					Etiam dictum odio elit, id faucibus urna elementum ac. Mauris in est nec tortor luctus
					auctor ut a velit. Suspendisse vulputate lectus arcu, sed condimentum risus rutrum vitae.
					Nullam sagittis ultricies nisl. Duis accumsan libero vel arcu sodales venenatis.
				</Accordion>

				<Accordion
					title="Section Six"
					subtitle={ this.state.showSubtitles ? 'With Subtitle and Status' : null }
					status={ { type: 'warning', text: 'Warning!', url: '/devdocs/design' } }
				>
					Suspendisse pellentesque diam in nisi pulvinar maximus. Integer feugiat feugiat justo ac
					vehicula. Curabitur iaculis, risus suscipit sodales auctor, nisl urna elementum sem, non
					vestibulum mauris ante et purus. Duis iaculis nisl neque, eget rutrum erat imperdiet non.
				</Accordion>
			</div>
		);
	}

	render() {
		console.log( jsxToString( <Gridicon /> ) );
		const { showCode } = this.props;
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

				<ComponentPlayground code={ this.exmapleCode() } scope={ scope } showCode={ showCode } />
			</div>
		);
	}
}
