/* eslint-disable no-console */
/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import { Button } from '@automattic/components';

export default class FoldableCardExample extends PureComponent {
	static displayName = 'FoldableCardExample';

	static defaultProps = {
		exampleCode: (
			<div>
				<div>
					<FoldableCard header="This is a foldable card" screenReaderText="More">
						These are its contents
					</FoldableCard>
				</div>

				<div>
					<FoldableCard header="This is a compact card" compact screenReaderText="More">
						I'm tiny! :D
					</FoldableCard>
				</div>
				<div>
					<FoldableCard header="This is a disabled card" disabled screenReaderText="More">
						You can't see me!
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This is a highlighted card"
						highlight="info"
						screenReaderText="More"
					>
						I'm highlighted!
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This is a foldable card with a custom action icon"
						icon="arrow-down"
						screenReaderText="More"
					>
						These are its contents
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This is a compact box with summary"
						summary="Unexpanded Summary"
						expandedSummary="Expanded Summary"
						screenReaderText="More"
					>
						This is the main content of the card.
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header={
							<div>
								<div>This is a multiline foldable card</div>
								<div>
									<small> with a summary component & a expanded summary component</small>
								</div>
							</div>
						}
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						summary={ <button className="button">Update</button> }
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						expandedSummary={ <button className="button">Update</button> }
						screenReaderText="More"
					>
						Nothing to see here. Keep walking!
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header={
							<div>
								<div>This is a multiline foldable card</div>
								<div>
									<small> with a summary component & a expanded summary component</small>
								</div>
							</div>
						}
						summary={
							<Button compact scary>
								Update
							</Button>
						}
						expandedSummary={
							<Button compact scary>
								Update
							</Button>
						}
					>
						Nothing to see here. Keep walking!
					</FoldableCard>
				</div>
				<div>
					<FoldableCard
						header="This card includes click, open and close actions. Check your console!"
						onClick={ function () {
							console.log( 'Clicked!' );
						} }
						onClose={ function () {
							console.log( 'Closed!' );
						} }
						onOpen={ function () {
							console.log( 'Opened!' );
						} }
					>
						Nothing to see here. Keep walking!
					</FoldableCard>
				</div>
			</div>
		),
	};

	handleClick = () => console.log( 'Clicked!' );
	handleClose = () => console.log( 'Closed!' );
	handleOpen = () => console.log( 'Opened!' );

	render() {
		return this.props.exampleCode;
	}
}
