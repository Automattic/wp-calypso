/**
 * /* eslint-disable max-len
 *
 * @format
 */

/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import jsxToString from 'jsx-to-string';

Gridicon.displayName = 'Gridicon';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';

Accordion.displayName = 'Accordion';

export default class extends React.Component {
	static displayName = 'Accordion';

	static defaultProps = {
		exampleCode: (
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

				<Accordion title="Section Three" subtitle="With Subtitle">
					Suspendisse pellentesque diam in nisi pulvinar maximus. Integer feugiat feugiat justo ac
					vehicula. Curabitur iaculis, risus suscipit sodales auctor, nisl urna elementum sem, non
					vestibulum mauris ante et purus. Duis iaculis nisl neque, eget rutrum erat imperdiet non.
				</Accordion>

				<Accordion
					title="Section Four"
					subtitle="With a Very Long Subtitle to Demonstrate the Fade Effect"
				>
					Drumstick ham tongue flank doner pork chop picanha. Cow short ribs tail kevin capicola
					ball tip. Leberkas shankle landjaeger tenderloin, chuck cupim pastrami cow frankfurter.
					Kielbasa bacon capicola shoulder porchetta, frankfurter rump short loin pig cupim.
				</Accordion>

				<Accordion
					title="Section Five"
					subtitle="With Subtitle and Icon"
					icon={ <Gridicon icon="time" /> }
				>
					Etiam dictum odio elit, id faucibus urna elementum ac. Mauris in est nec tortor luctus
					auctor ut a velit. Suspendisse vulputate lectus arcu, sed condimentum risus rutrum vitae.
					Nullam sagittis ultricies nisl. Duis accumsan libero vel arcu sodales venenatis.
				</Accordion>

				<Accordion
					title="Section Six"
					subtitle="With Subtitle and Status"
					status={ { type: 'warning', text: 'Warning!', url: '/devdocs/design' } }
				>
					Suspendisse pellentesque diam in nisi pulvinar maximus. Integer feugiat feugiat justo ac
					vehicula. Curabitur iaculis, risus suscipit sodales auctor, nisl urna elementum sem, non
					vestibulum mauris ante et purus. Duis iaculis nisl neque, eget rutrum erat imperdiet non.
				</Accordion>
			</div>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
